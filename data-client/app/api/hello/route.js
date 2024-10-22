import { NextResponse } from 'next/server';

export async function GET(request) {
  return new Response('Hello, Next.js!,')
}
   
/** 
* POST ENDPOINT    
* handles POST request, prints request body 
*
 * @param {Object} request - The request object, can be anything in its JSON body.
 * @returns {Object} NextResponse object containing a JSON response. The response contains a status of the operation and, in case of an error, an error message.
 * 
 * @throws Will throw an error if values missing in the request, if there's an HTTP error, or if the update to Webflow fails.
 */
export async function POST(request) {
  console.log("IN POST REQUEST HANDLER FUNCTION\n");
  console.log("REQUEST:\n",request);
  const requestBody = await request.json();
  console.log("REQUEST BODY:",JSON.stringify(requestBody));
  
  
  try {
    const updateRequestData = 
    {
      "one": false,
      "two": false,
      "three": true,
      "requestData": requestBody
    };

    console.log("updateRequestData", updateRequestData);

    // return NextResponse.json({ updateRequestData }, {
    //   headers: {
    //     'Access-Control-Allow-Origin': FRONTEND_URL,
    //     'Access-Control-Allow-Methods': 'POST',
    //     'Access-Control-Allow-Headers': 'Content-Type'
    //   },
    // });
    return NextResponse.json(updateRequestData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}