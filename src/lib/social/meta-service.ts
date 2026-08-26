import { encryptToken, decryptToken } from './crypto-service';

export interface MetaPageInfo {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username: string;
    profile_picture_url?: string;
  };
}

export interface MetaPublishResult {
  success: boolean;
  platform: 'INSTAGRAM' | 'FACEBOOK';
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
  rawResponse?: any;
}

const META_GRAPH_VERSION = 'v20.0';
const META_GRAPH_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * Generates official Meta OAuth Authorization URL for Instagram Professional & Facebook Pages.
 */
export function getMetaOAuthUrl(clientId: string, redirectUri: string): string {
  const appId = (process.env.META_APP_ID || process.env.NEXT_PUBLIC_META_APP_ID || '').trim();
  if (!appId) {
    throw new Error('META_APP_ID is not configured in server environment variables.');
  }

  const scopes = [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'instagram_basic',
    'instagram_content_publish',
    'business_management',
  ].join(',');

  const state = Buffer.from(JSON.stringify({ clientId, timestamp: Date.now() })).toString('base64');

  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
}

/**
 * Exchanges OAuth authorization code for long-lived user token and fetches connected pages & IG accounts.
 */
export async function exchangeMetaCodeForAccounts(code: string, redirectUri: string) {
  const appId = process.env.META_APP_ID?.trim();
  const appSecret = process.env.META_APP_SECRET?.trim();

  if (!appId || !appSecret) {
    throw new Error('Meta App ID and App Secret are required for OAuth code exchange.');
  }

  // 1. Exchange code for short-lived access token
  const tokenUrl = `${META_GRAPH_URL}/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&client_secret=${appSecret}&code=${code}`;

  const tokenRes = await fetch(tokenUrl);
  const tokenData = await tokenRes.json();

  if (!tokenRes.ok || tokenData.error) {
    throw new Error(tokenData.error?.message || 'Failed to exchange Meta authorization code.');
  }

  const shortLivedToken = tokenData.access_token;

  // 2. Exchange short-lived token for long-lived (60 days) access token
  const longLivedUrl = `${META_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
  const longLivedRes = await fetch(longLivedUrl);
  const longLivedData = await longLivedRes.json();
  const userToken = longLivedData.access_token || shortLivedToken;

  // 3. Fetch user pages with Instagram business accounts attached
  const pagesUrl = `${META_GRAPH_URL}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,profile_picture_url}&access_token=${userToken}`;
  const pagesRes = await fetch(pagesUrl);
  const pagesData = await pagesRes.json();

  if (!pagesRes.ok || pagesData.error) {
    throw new Error(pagesData.error?.message || 'Failed to fetch Meta pages.');
  }

  return {
    userToken,
    pages: (pagesData.data || []) as MetaPageInfo[],
  };
}

/**
 * Checks token connection health with Meta Graph API.
 */
export async function checkMetaTokenHealth(encryptedToken: string, accountId: string): Promise<{
  healthy: boolean;
  status: 'HEALTHY' | 'WARNING' | 'EXPIRED' | 'DISCONNECTED';
  message: string;
}> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    return {
      healthy: false,
      status: 'DISCONNECTED',
      message: 'No active access token found in secure storage.',
    };
  }

  // If mock/placeholder token
  if (token.startsWith('mock_') || token.startsWith('demo_')) {
    return {
      healthy: true,
      status: 'HEALTHY',
      message: 'Demo credentials active. Ready for live Meta App credentials.',
    };
  }

  try {
    const res = await fetch(`${META_GRAPH_URL}/${accountId}?fields=id,name&access_token=${token}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      const code = data.error?.code;
      if (code === 190 || data.error?.error_subcode === 463 || data.error?.message?.includes('expired')) {
        return {
          healthy: false,
          status: 'EXPIRED',
          message: 'Instagram / Facebook authorization has expired. Please reconnect account.',
        };
      }
      return {
        healthy: false,
        status: 'WARNING',
        message: data.error?.message || 'Meta API returned an authorization notice.',
      };
    }

    return {
      healthy: true,
      status: 'HEALTHY',
      message: 'Meta Graph API connection verified and active.',
    };
  } catch (err: any) {
    return {
      healthy: false,
      status: 'WARNING',
      message: `Network error verifying Meta API: ${err.message}`,
    };
  }
}

/**
 * Publishes a post to Instagram Professional Account via Meta Graph API.
 * Uses official 2-step media container workflow:
 * 1. POST /{ig-user-id}/media (create media container)
 * 2. POST /{ig-user-id}/media_publish (publish container)
 */
export async function publishToInstagram(
  igUserId: string,
  encryptedToken: string,
  postData: {
    caption: string;
    mediaUrl: string;
    mediaType?: 'image' | 'video';
    locationId?: string;
  }
): Promise<MetaPublishResult> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    return {
      success: false,
      platform: 'INSTAGRAM',
      error: 'Instagram authorization token missing. Please connect Instagram Professional account in KAIRO Social.',
    };
  }

  const cleanCaption = postData.caption.trim();
  const isVideo = postData.mediaType === 'video';

  try {
    // Step 1: Create Media Container
    const containerParams = new URLSearchParams({
      access_token: token,
      caption: cleanCaption,
      ...(isVideo ? { media_type: 'REELS', video_url: postData.mediaUrl } : { image_url: postData.mediaUrl }),
      ...(postData.locationId ? { location_id: postData.locationId } : {}),
    });

    const createContainerRes = await fetch(`${META_GRAPH_URL}/${igUserId}/media`, {
      method: 'POST',
      body: containerParams,
    });
    const containerData = await createContainerRes.json();

    if (!createContainerRes.ok || !containerData.id) {
      const errMessage = containerData.error?.message || 'Failed to create Instagram media container.';
      return {
        success: false,
        platform: 'INSTAGRAM',
        error: errMessage,
        rawResponse: containerData,
      };
    }

    const creationId = containerData.id;

    // If video, wait for container status to be READY (polled up to 3 times)
    if (isVideo) {
      let isReady = false;
      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusRes = await fetch(`${META_GRAPH_URL}/${creationId}?fields=status_code&access_token=${token}`);
        const statusData = await statusRes.json();
        if (statusData.status_code === 'FINISHED') {
          isReady = true;
          break;
        } else if (statusData.status_code === 'ERROR') {
          return {
            success: false,
            platform: 'INSTAGRAM',
            error: 'Instagram video container processing failed on Meta servers.',
            rawResponse: statusData,
          };
        }
      }
    }

    // Step 2: Publish Container
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: token,
    });

    const publishRes = await fetch(`${META_GRAPH_URL}/${igUserId}/media_publish`, {
      method: 'POST',
      body: publishParams,
    });
    const publishData = await publishRes.json();

    if (!publishRes.ok || !publishData.id) {
      return {
        success: false,
        platform: 'INSTAGRAM',
        error: publishData.error?.message || 'Failed to publish media container on Instagram.',
        rawResponse: publishData,
      };
    }

    const igMediaId = publishData.id;
    return {
      success: true,
      platform: 'INSTAGRAM',
      platformPostId: igMediaId,
      platformPostUrl: `https://www.instagram.com/p/${igMediaId}`,
      rawResponse: publishData,
    };
  } catch (err: any) {
    return {
      success: false,
      platform: 'INSTAGRAM',
      error: `Instagram Publishing Network Exception: ${err.message}`,
    };
  }
}

/**
 * Publishes a post to Facebook Page via Meta Graph API.
 * Uses /{page-id}/photos for image posts or /{page-id}/feed for status posts.
 */
export async function publishToFacebook(
  pageId: string,
  encryptedToken: string,
  postData: {
    caption: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
  }
): Promise<MetaPublishResult> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    return {
      success: false,
      platform: 'FACEBOOK',
      error: 'Facebook Page token missing. Please connect your Facebook Page in KAIRO Social.',
    };
  }

  const cleanCaption = postData.caption.trim();

  try {
    let endpoint = `${META_GRAPH_URL}/${pageId}/feed`;
    const params = new URLSearchParams({
      access_token: token,
      message: cleanCaption,
    });

    if (postData.mediaUrl) {
      if (postData.mediaType === 'video') {
        endpoint = `${META_GRAPH_URL}/${pageId}/videos`;
        params.set('file_url', postData.mediaUrl);
        params.set('description', cleanCaption);
      } else {
        endpoint = `${META_GRAPH_URL}/${pageId}/photos`;
        params.set('url', postData.mediaUrl);
        params.set('caption', cleanCaption);
      }
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      body: params,
    });
    const data = await res.json();

    if (!res.ok || (!data.id && !data.post_id)) {
      return {
        success: false,
        platform: 'FACEBOOK',
        error: data.error?.message || 'Failed to publish post on Facebook Page.',
        rawResponse: data,
      };
    }

    const postId = data.post_id || data.id;
    return {
      success: true,
      platform: 'FACEBOOK',
      platformPostId: postId,
      platformPostUrl: `https://www.facebook.com/${postId}`,
      rawResponse: data,
    };
  } catch (err: any) {
    return {
      success: false,
      platform: 'FACEBOOK',
      error: `Facebook Publishing Network Exception: ${err.message}`,
    };
  }
}
