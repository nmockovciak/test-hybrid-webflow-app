import { NextResponse } from 'next/server';
import { getAPIClient } from '@/utils/webflow_helper';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

/** 
* GET ENDPOINT    /api/cms/items?collectionId={collectionId}&auth={token}
* handles GET CMS Collections call
*/
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('collectionId');
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

  const webflowAPI = getAPIClient(webflowAuth, true);

  try {
    const response  = await webflowAPI.get(`/collections/${collectionId}/items`);

    const { data } = response;
    const { items } = data;

    return NextResponse.json({ items }, {
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
* POST ENDPOINT    /api/cms/items
* handles CMS Collection Items Bulk Update API Call with items in body 
*
 * @param {Object} request - The request object, expected to contain 'collectionId' and 'items' in its JSON body.
 * @returns {Object} NextResponse object containing a JSON response. The response contains a status of the operation and, in case of an error, an error message.
 * 
 * @throws Will throw an error if values missing in the request, if there's an HTTP error, or if the update to Webflow fails.
 */
export async function POST(request) {
  const jsonRequest = await request.json();
  console.log("jsonRequest:\n",jsonRequest);
  
  const { collectionId, auth, items } = jsonRequest;
  if ( !collectionId || !auth || !items || items?.length < 1) {
    return NextResponse.json({ error: 'Missing collectionId, items, or auth. Make sure request is sent with proper list of items.' }, {
      headers: {
        'Access-Control-Allow-Origin': FRONTEND_URL,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }
  const webflowAPI = getAPIClient(auth);
  
  try {
    console.log("INSIDE TRY BLOCK");
    console.log("Request Body Items:");
    console.log(JSON.stringify({items}));

    const updateResponse = await webflowAPI.patch(`/collections/${collectionId}/items`, {items});
    const updateResponseData = updateResponse?.data;

    return NextResponse.json(updateResponseData, {
      headers: {
        'Access-Control-Allow-Origin': FRONTEND_URL,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.log("ERROR");
    console.log(error);
    return NextResponse.json({ error: error.message });
  }
}
