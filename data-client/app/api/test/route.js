import { NextResponse } from 'next/server';
import { getAPIClient } from '@/utils/webflow_helper';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

/** 
* GET ENDPOINT    /api/test?siteId={siteId}&auth={token}
* handles GET CMS Collections call
*/
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const webflowAuth = searchParams.get('auth');

  if (!webflowAuth) {
    return NextResponse.json({ error: 'Missing auth' }, {
      headers: {
        'Access-Control-Allow-Origin': FRONTEND_URL,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const webflowAPI = getAPIClient(webflowAuth);

  try {
    const response  = await webflowAPI.get(`/sites/${siteId}/collections`);

    const { data } = response;
    const { collections } = data;

    return NextResponse.json({ collections }, {
      headers: {
        'Access-Control-Allow-Origin': FRONTEND_URL,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Origin'
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, {
      headers: {
        'Access-Control-Allow-Origin': FRONTEND_URL,
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Origin'
      },
    });
  }

}
   
/** 
* POST ENDPOINT    /api/test
* handles CMS Collection Item Update (Live) with fieldData in body 
*
 * @param {Object} request - The request object, expected to contain 'siteId', 'collectionId', 'itemId' and 'fieldData' in its JSON body.
 * @returns {Object} A NextResponse object containing a JSON response. The response contains a status of the operation and, in case of an error, an error message.
 * 
 * @throws Will throw an error if values missing in the request, if there's an HTTP error, or if the update to Webflow fails.
 */
export async function POST(request) {
  const { collectionId, itemId, auth, fieldData } = await request.json();
  if ( !collectionId || !itemId || !fieldData || !auth) {
    return NextResponse.json({ error: 'Missing collectionId, itemId, fieldData, or auth' }, {
      headers: {
        'Access-Control-Allow-Origin': FRONTEND_URL,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  const webflowAPI = getAPIClient(auth);

  const requestData = 
    {
      "isArchived": false,
      "isDraft": false,
      fieldData
    };
  
  try {

    const response = await webflowAPI.patch(`/collections/${collectionId}/items/${itemId}/live`, requestData);
      const responseData = response.data;
      
      return NextResponse.json({ responseData }, {
        headers: {
          'Access-Control-Allow-Origin': FRONTEND_URL,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });

  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
