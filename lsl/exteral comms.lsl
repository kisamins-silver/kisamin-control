string externalURL = "http://kisamin-control-center-kisamin-rlv-controler.1d35.starter-us-east-1.openshiftapps.com/api?query=";
string internalURL;
string url;

list whoAmI = ["","",""];
list whoOwnsMe = ["","",""];
list restrictions;

key queryRequestID;
string queryString;

praseQuery(string json){
    string data = llList2String(llJson2List(json),1);
    list data_list = llParseString2List(data,  ["{","}","[","]","\"",":",","], [] );
    integer i = 0;
    integer ownerIndex = -1;
    integer slaveIndex = -1;
    for (; i < llGetListLength(data_list); i++) {
        if ( llList2String(data_list, i)  == "owners" ) ownerIndex = i;
        if ( llList2String(data_list, i)  == "slaves" ) slaveIndex = i;
    }
    llOwnerSay(llList2CSV(data_list));
}

praseAvatar(string str){
    
}

praseRestriction(string str){
    
}

praseOwner(string str){
    
}

praseSlave(string str){
    
}

issueRLV(string command){
    llOwnerSay(command);
}

ini(){
    queryRequestID = "";
    url = "";
    llRequestURL();
    queryString = "{
                      owners{
                        avatar{
                          key
                          display_name
                        },
                        owned_slaves{
                          avatar{
                            display_name
                          }
                          restrictions{
                            command
                            allow
                          }
                        }
                      }
                      slaves{
                        avatar{
                          key
                          display_name
                        }
                      }
                    }";
}

// ###############################################
// Routine to parse a string sent through the 
// http server via post.
//       parsePostData(theMessage)
// Returns a strided list with stride length 2.
// Each set has the key and then its value.
// ###############################################

list parsePostData(string message) {
    list postData = [];         // The list with the data that was passed in.
    list parsedMessage = llParseString2List(message,["&"],[]);    // The key/value pairs parsed into one list.
    integer len = ~llGetListLength(parsedMessage);
 
    while(++len) {          
        string currentField = llList2String(parsedMessage, len); // Current key/value pair as a string.
 
        integer split = llSubStringIndex(currentField,"=");     // Find the "=" sign
        if(split == -1) { // There is only one field in this part of the message.
            postData += [llUnescapeURL(currentField),""];  
        } else {
            postData += [llUnescapeURL(llDeleteSubString(currentField,split,-1)), llUnescapeURL(llDeleteSubString(currentField,0,split))];
        }
    }
    // Return the strided list.
    return postData ;
}

default
{
    state_entry() { ini(); }
    on_rez(integer n) { ini(); }
 
    changed(integer c)
    {
        if (c & (CHANGED_REGION | CHANGED_REGION_START | CHANGED_TELEPORT) )
        {
            ini();
        }
    }

    touch_start(integer total_number)
    {
        url = externalURL+llEscapeURL(queryString);
        queryRequestID = llHTTPRequest(url,[],"");
    }
    
    http_response(key request_id, integer status, list metadata, string body)
    {
        if (request_id != queryRequestID) return; // exit if unknown
        llOwnerSay(body);
        praseQuery(body);
    }
    
    http_request(key id, string method, string body)
    {
        if (method == URL_REQUEST_GRANTED)
        {
            url = body;
        }
        else if (method == URL_REQUEST_DENIED)
        {
            llSay(0, "Something went wrong, no url. " + body);
        }
        else if (method == "GET")
        {
            // data is being fetched
        }
        else if (method == "POST")
        {
            // data is being sent
            // llOwnerSay("Received information form the outside: " + body);
            // incomingMessage = parsePostData(body);
            // llOwnerSay(llDumpList2String(incomingMessage,"\n"));
 
            // llHTTPResponse(id,200,"You passed the following:\n" + 
            //                llDumpList2String(incomingMessage,"\n"));
        }
        else
        {
            llHTTPResponse(id,405,"Method unsupported");
        }
    }
}
