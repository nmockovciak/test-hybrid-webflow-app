"use client";
import { motion } from "framer-motion"; // For animations
import { list } from "postcss";
import React, { useEffect, useState } from "react";
// import Image from "next/image";
import { createHmac } from 'node:crypto';
import { validateHeaderValue } from "node:http";
import { devNull } from "node:os";
import { any } from "webflow-api/core/schemas";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface Site {
  id: string;
}

interface Elements {
  elements: string;
}

interface Image {
  url: string;
}

interface UserInputProps {
  selectedSite: any;
  setImages: any;
  setPage: any;
  token: string;
}

interface LoginProps {
  setPage: any;
  token: any;
  setToken: any;
}

interface StringIndexedObject {
  [key: string]: string;
}

const MainPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [token, setToken] = useState<string>("");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  // const [elements, setElements] = useState<Elements | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [mounted, setMounted] = React.useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {

    if (typeof window !== "undefined") {
      // Get authorization, if already authorized then set setPage to 1
      const auth = localStorage.getItem("devflow_token");

      const getSiteInfo = async () => {
        const siteInfo = await webflow.getSiteInfo();
        console.log("siteInfo:\n", siteInfo);
        console.log("siteInfo?.siteId:\n", siteInfo?.siteId);
        const siteId = siteInfo?.siteId;
        setSelectedSite({ id: siteInfo?.siteId });
        console.log("XX selectedSite:\n", selectedSite);
      };

      // const extractElementDetails = (elementArray: AnyElement[] | null, p0: never[]) => {
      //   return elementArray?.map((e) => {return ({element: e, id: e.id, hasChildren: e.children, type: e.type, domId: e.domId ? e.getDomId() : null, children: (e.children ? (e.getChildren() ? () => extractElementDetails(e.getChildren(),[]) : null) : null)})});
      // };

      setPage(auth ? 1 : 0);
      setToken(auth || "");
      getSiteInfo();
      // getSiteElements();
    }
  }, []);

  if (!mounted) {
    return null;
  }

  // If token is undefined send user to Login Page
  if (!token) {
    return <Login setPage={setPage} token={token} setToken={setToken} />;
  }

  // This function determines which content appears on the page
  switch (page) {
    case 0:
      return <Login setPage={setPage} token={token} setToken={setToken} />;
    case 1:
      return (
        <UserInput selectedSite={selectedSite} setImages={setImages} token={token} setPage={setPage} />
      );
  }
};

const Login: React.FC<LoginProps> = ({
  setPage,
  token,
  setToken,
}: {
  setPage: any;
  token: any;
  setToken: any;
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen py-2 bg-wf-gray text-wf-lightgray"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-8">
        <div>
          <h1 className="mt-3 text-4xl font-bold text-gray-200 mb-2">
            Site Build Helper App
          </h1>
          <h2 className="mt-3 text-lg text-gray-400 mb-2">by Devflow.party</h2>
          <div className="mt-8 space-y-6">
            <input
              type="text"
              onBlur={(e) => {
                setToken(e.target.value);
              }}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Enter your auth token"
            />
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer border-gray-700"
              onClick={() => {
                localStorage.setItem("devflow_token", token);
                setPage(1);
              }}
            >
              Authenticate
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const UserInput: React.FC<UserInputProps> = ({ selectedSite, setImages, token, setPage }) => {
  // const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const [n, setN] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [newPageName, setNewPageName] = useState<string>("");
  const [fontFamily, setFontFamily] = useState<string>("");
  
  const [allCollxns, setAllCollxns] = useState<any>([]);
  const [mainTempCollxnID, setMainTempCollxnID] = useState<string>("");
  const [programsCollxnID, setProgramsCollxnID] = useState<string>("");
  const [growEntriesCollxnID, setGrowEntriesCollxnID] = useState<string>("");
  const [faqsCollxnID, setFaqsCollxnID] = useState<string>("");

  const [cmsUpdatesList, setCmsUpdatesList] = useState<any>([]);
  const [varUpdatesList, setVarUpdatesList] = useState<any>([]);

  const [ppSubdomainInput, setPpSubdomainInputValue] = useState<string>("");
  const [mainCTALinkInput, setMainCTALinkInputValue] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get authorization, if already authorized then set setPage to 1
      const auth = localStorage.getItem("devflow_token");
      setPage(auth ? 1 : 0);
      // setToken(auth || "");

    }
  }, []);


  const updateVariables = async (variables: any[]) => {

    console.log("UPDATING VARIABLES:");
    console.log(variables);
    console.log(JSON.stringify(variables));

    const collection = await webflow.getDefaultVariableCollection();

    for (const variable of variables) {
      const varName = variable?.name;
      const varVal = variable?.value;

      const siteVariable = await collection?.getVariableByName(varName);
      if (siteVariable) {
        siteVariable?.set(varVal);
      }

    }

  };

  const changeFont = async () => {
    console.log("CREATING PAGE W NAME: " + fontFamily);

    const collection = await webflow.getDefaultVariableCollection();
    const fontFamilyVariable = await collection?.getVariableByName("font-family");
    if (fontFamilyVariable?.type === "FontFamily") {
      fontFamilyVariable?.set(fontFamily);
    }
  };

  const createPage = async () => {
    console.log("CREATING PAGE W NAME: " + newPageName);
    // Create new page and set page name
    const newPage = await webflow.createPage() as Page;
    newPage.setName(newPageName);
    newPage.setTitle(newPageName);
    // Switch to new page
    await webflow.switchPage(newPage);
  };

  const getPages = async () => {
    console.log("GETTING PAGES");
    const pages = await webflow.getAllPagesAndFolders();
    console.log(pages);
    console.log(JSON.stringify(pages));
    
    for (const page of pages) {
      if (page.type === "Page") {
        const pageName = await page.getName().then(d => {return d;});
        if (pageName.includes("Locations Template")) {
          await webflow.switchPage(page);
          const currentPage = await webflow.getCurrentPage();
          const currentPageName = await currentPage?.getName()
          // Print page details
          console.log("Current Page:");
          console.log(currentPage, currentPageName);

          let amenitiesComp;
          const allComponents = await webflow.getAllComponents();
          for (const component of allComponents) {
            const compName = await component.getName();
            if (compName === "Amenities") {
              amenitiesComp = component;
            }
          }
          const rootEl = await webflow.getRootElement();

          if (amenitiesComp && rootEl?.children){
            const children = await rootEl.getChildren();
            await children[0].before(amenitiesComp);

            // await rootEl?.after(amenitiesComp);
          }
          

          // const rootEl = await webflow.getRootElement();
          
        }
      }
      
    }

  };

  const changeHeadingOne = async (textValue: string) => {
    // let mainHeadElement;
    const allElements = await webflow.getAllElements();

    const benefitsHeaderOne = allElements?.filter(e => e.type?.includes("Heading") && (e?.domId && e.getDomId().then(did => did && did === "cpnt-bfts-hdr-1")));
    const benefitsHeaderOneEl = benefitsHeaderOne && benefitsHeaderOne[0];
    console.log("benefitsHeaderOneEl:");
    console.log(JSON.stringify(benefitsHeaderOneEl));

    if (benefitsHeaderOneEl && benefitsHeaderOneEl.textContent){
      benefitsHeaderOneEl.setTextContent(textValue);
    }
  };

  const updateCMSVals = async () => {
    setIsLoading(true);

    // (1) GET CMS COLLECTIONS, filter for correct collections ("Programs" and "GROW Entries")

    // PROGRAMS -
    // (1) FOR EACH ITEM, POST-UPDATE "program-cta-external-url" FIELD TO mainCTALink val

    // GROW -
    // (1) GET THAT CMS COLLECTION'S SINGLE ITEM
    // (2) CREATE scheduleURL LINK FROM ppsubdomain
    // (2) POST-UPDATE COLLECTION ITEM "grow-schedule-form-id" WITH scheduleURL VAL

    console.log("ppSubdomainInput:");
    console.log(ppSubdomainInput);

    console.log("mainCTALinkInput:");
    console.log(mainCTALinkInput);


    try {

      console.log("GET:");
      console.log(`${BACKEND_URL}/api/cms?siteId=${selectedSite?.id}&auth=${token}`);

      const collectionsResponseObj = await fetch(
        `${BACKEND_URL}/api/cms?siteId=${selectedSite?.id}&auth=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
        }
      ).then(res => res.json())
      .then(data => {
        setAllCollxns(data);
        const cllxns = data.collections;
        const programsCllxn = cllxns.filter((c: { slug: string | string[]; }) => c.slug.includes("programs"));
        const programsCID = programsCllxn.map((c: { id: any; }) => c.id);
        setProgramsCollxnID(programsCID);
        const growEntriesCllxn = cllxns.filter((c: { slug: string | string[]; }) => c.slug.includes("grow-entries"));
        const growEntriesCID = growEntriesCllxn.map((c: { id: any; }) => c.id);
        setGrowEntriesCollxnID(growEntriesCID);
        const faqsCllxn = cllxns.filter((c: { slug: string | string[]; }) => c.slug.includes("faqs"));
        const faqsCID = faqsCllxn.map((c: { id: any; }) => c.id);
        setFaqsCollxnID(faqsCID);
        return {programsCID, growEntriesCID, faqsCID, cllxns};
      });

      console.log("collectionsResponseObj:");
      console.log(collectionsResponseObj);

      const {programsCID, growEntriesCID, faqsCID} = collectionsResponseObj;

      // GET Grow Entries Item, update with new schedule URL

      const getGrowEntriesItemsResponse = await fetch(
        `${BACKEND_URL}/api/cms/items?collectionId=${growEntriesCID[0]}&auth=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const growEntriesItem = await getGrowEntriesItemsResponse.json().then(data => {
        console.log("items response:\n" + JSON.stringify(data));
        return data.items[0];
      });

      const scheduleURL = ppSubdomainInput + "/open/calendar?framed=1";

      const growEntriesUpdateRequestBody = {collectionId: growEntriesCID[0], auth: token, items: [{
        "isArchived": false,
        "isDraft": false,
        "id": growEntriesItem.id,
        "fieldData": {
          "grow-schedule-form-id": scheduleURL,
          "name": growEntriesItem.fieldData?.name,
          "slug": growEntriesItem.fieldData?.slug
        }
      }]};

      const growEntriesUpdateResponse = await fetch(
        `${BACKEND_URL}/api/cms/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(growEntriesUpdateRequestBody)
        }
      );

      growEntriesUpdateResponse.json().then(data => {
        console.log(data);
      });

      if (!growEntriesUpdateResponse.ok) {
        console.log(`HTTP error! status: ${growEntriesUpdateResponse.status}`);
      }

      // GET Main FAQS Item ID for reference in Programs
      
      const getFAQItemsResponse = await fetch(
        `${BACKEND_URL}/api/cms/items?collectionId=${faqsCID[0]}&auth=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const mainFaqsItem = await getFAQItemsResponse.json().then(data => {
        console.log("items response:\n" + JSON.stringify(data));
        const items = data.items;
        return (items && items.length > 0) && items.filter((i: { fieldData: {slug: string} }) => i?.fieldData?.slug === "main-faqs")[0];
      });
      const mainFaqsItemId = mainFaqsItem?.id;

      // GET PROGRAMS

      const getProgramsItemsResponse = await fetch(
        `${BACKEND_URL}/api/cms/items?collectionId=${programsCID[0]}&auth=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      )

      const programsUpdateCalls: { itemId: any; fieldData: any; }[] = [];

      await getProgramsItemsResponse.json().then(data => {
        console.log("items response:\n" + JSON.stringify(data));
        const items = data.items;

        // required: subheading, description, cta-text, general-settings, name, slug

        for (const item of items) {
          const itemId = item?.id;
          const fields = {
                            "subheading": item?.fieldData?.subheadings,
                            "description": item?.fieldData?.description,
                            "cta-text": item?.fieldData['cta-text'],
                            "general-settings": item?.fieldData['general-settings'],
                            "name": item?.fieldData?.name,
                            "slug": item?.fieldData?.slug,
                            "program-cta-external-url": mainCTALinkInput,
                            "faqs": mainFaqsItemId
                          };
          // fieldData['program-cta-external-url'] = mainCTALinkInput;
          programsUpdateCalls.push({itemId, "fieldData": fields});
        }

        console.log("Programs Updates List:");
        console.log(programsUpdateCalls);
      });

      const programsItems = [];

      for (const update of programsUpdateCalls) {
        const programRequest = {
          id: update.itemId,
          isArchived: false,
          isDraft: false,
          fieldData: update.fieldData
        };
        // console.log(programRequest);
        programsItems.push(programRequest);
      }

      const bulkProgramsRequestBody = {collectionId: programsCID[0], auth: token, items: programsItems};

      const response = await fetch(
        `${BACKEND_URL}/api/cms/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bulkProgramsRequestBody)
        }
      );

      response.json().then(data => {
        console.log(data);
      });

      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center py-2 px-2 bg-wf-gray text-wf-lightgray h-screen overflow-auto">
      <div className="text-center space-y-4 flex flex-col h-full justify-between pb-2">

      <div>
          <h1 className="text-lg font-bold text-gray-200 mb-2 mt-2">
            Input the Following to Update CMS:
          </h1>
          <br/>
          <h3>ppSubdomain:</h3>
          <textarea
            className="bg-gray-700 rounded-md p-2 w-full h-16 -mb-2 resize-none"
            placeholder="subdomain"
            value={ppSubdomainInput}
            onChange={(e) => setPpSubdomainInputValue(e.target.value)}
          />
          <br/>
          <h3>mainCTALink for Programs:</h3>
          <textarea
            className="bg-gray-700 rounded-md p-2 w-full h-16 -mb-2 resize-none"
            placeholder="subdomain"
            value={mainCTALinkInput}
            onChange={(e) => setMainCTALinkInputValue(e.target.value)}
          />
          <button
            onClick={() => updateCMSVals()}
            className="rounded-md border border-transparent py-2 px-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer border-gray-700 w-full"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
