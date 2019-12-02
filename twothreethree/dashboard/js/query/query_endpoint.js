var defaultLocalEndPoint = "http://localhost:3030/DB/edsa_2016/query?query=",
                        // http://localhost:3030/DB/edsa/query?query=queryAsEncodedUriPart&output=json&stylesheet=
    defaultRemoteEndPoint = "http://dashboard.edsa-project.eu:3030/data/databases/rdfstore/edsa/query?query=",
    defaultStyleSheet = "";


var defaultDataHeaders = { jobPostingUri : "jobPostingUri",  //"identifier",
                            /*datePosted : "datePosted",*/
                            jobTitle : "jobTitle",       //"title" ,
                            hiringOrganization : "hiringOrganization",
                            jobLocation : "jobLocation",
                            /*countryCode : "countryCode",*/
                            description : "description",
                          };


var contentType = { text : "text",
                    json : "json",
                    xml : "xml",
                    csv : "csv",
                    tsv : "tsv",
                  };



var queryType = { get_job_postings : 50,
                  get_specified_skills : 51,
                  get_extracted_skills : 52,
                  get_location : 53,
                  get_start_dates : 54,
                  get_industry_sector : 55,
                  filter_by_skill : 56,
                  filter_by_posting_date : 57,
                  filter_by_location : 58,
                  filter_by_country : 59,
                  //... add others as fields populated
                };

var locationAggregate = { city : 0,
                          region : 1,
                          country : 2,
                          coordinates : 3,
                        };

var timeAggregate = { day : 10,
                      week : 11,
                      month : 12,
                      quarter : 13,
                      year : 14,
                    };

var booleanFlag = { and_query : 20,
                    or_query : 21,
                    x_or_query : 22,
                  };

var previewOptions = {  table_preview : "table_preview",
                        map_view : "map_view",
                        parcoords_view : "parcoords_view",
                        //exportResults : 31,
                    };
var currentPage = 0,
    lastPage,
    defaultPageCount = 10;


var parseResults = function(parseFunction, queryResults, outputDataType, htmlElements) {
                      return parseQueryResults(parseFunction, queryResults, outputDataType, htmlElements);
                    };
var lastParsedResults;
var predefinedSkills;

function runQuery(query, sparqlEndPoint, outputDataType, parseFunction, htmlElements, dataHeaders, overrideContainerHeight, appendToExisting) {
  $.ajax({
    error: function (xhr, statusMessage, status) {
      console.log("Error retrieving results: '" + statusMessage + "'");
      if (statusMessage == "parsererror")
        alert("Error parsing result set. Retry query with output as 'text' or 'json'.")
      else
        alert("Failed to connect to database; unable to retrieve posting detail.");

      if (!parseFunction && htmlElements.length > 1) { // if header defined...
        document.getElementById(htmlElements[1]).style.display = "none";
        for (var i = 0; i < htmlElements.length; i++)
          if (!Array.isArray(htmlElements[i]))
            document.getElementById(htmlElements[i]).innerHTML = "";
      }
    },
    dataType: outputDataType,
    url: constructSparqlQuery(query, sparqlEndPoint, outputDataType),
    statusCode: {
      400: function (error) {
        var errorMessage = "yikes!!! something went badly wrong! <br /query: " + query;
        if (parseFunction)
          alert(errorMessage);
        else
          document.getElementById("" + htmlElements[0] + "").innerHTML = errorMessage;
      }
    },
    success: function(queryResults) {
      console.log(queryResults);

      if (queryResults.results.bindings.length == 0) {
        alert("Query found no matches!")

        var elements = htmlElements[htmlElements.length - 1];
        if (Array.isArray(elements) && (elements[0] == "show_hide_elements")) {
          document.getElementById(elements[0]).type = "submit";
          document.getElementById(elements[1]).style.display = "none";
        }
        return;
      }

//      $.each(queryResults.results.bindings, function(i, result) {
//        printOut += '<li>' + result.jobLocation.value + ' ' + result.datePosted.value + '</li>';
//      });

//      var previewOption;
//      if (Array.isArray(parseFunction) && (parseFunction.length == 2)) {  // length WILL be 2, but play safe
//
//        if (parseFunction[1] == previewOptions.table_preview) // previewOption
//          dataHeaders = queryResults.head.vars;
////        previewOption = parseFunction[1];
////        parseFunction = parseFunction[0];
//      }
////      if (previewOption == previewOptions.table_preview) {
////        dataHeaders = queryResults.head.vars;
////        parseFunction = undefined; // reset...- need to by-pass next call - with parseFunction
////      }

      if (parseFunction)
        parseResults(parseFunction, queryResults, outputDataType, htmlElements);
      else {
        if (!appendToExisting)
          document.getElementById("" + htmlElements[0] + "").innerHTML = "";

        if (dataHeaders == null)
          document.getElementById("" + htmlElements[0] + "").innerHTML =
                (((outputDataType == null) || (outputDataType.trim().length == 0) || (outputDataType == contentType.json)) ? JSON.stringify(queryResults, null, 3) : queryResults);
        else {
          if (htmlElements.length > 1) // if header defined...
            document.getElementById(htmlElements[1]).style.display = "block";

          tabulate("jobPostingUri", queryResults.results.bindings, dataHeaders, "#" + htmlElements[0], overrideContainerHeight, true);
          //location.href = "#" + outputElementId;  // @todo - sort out
        }
      } // end tabulate or call specific function
    } // end output on success
  });
}

function getJobPosting(postingId, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getJobPostingDetailQuery +
          "VALUES ?jobPostingUri { <" + postingId + "> }" +
        "}" +
        "ORDER BY ?skillUri";
  console.log(query)

  runQuery(query, sparqlEndPoint, outputDataType, null, htmlElements, Object.keys(defaultDataHeaders), false);
}

function runPresetQuery(postingIds, queryType, sparqlEndPoint, outputDataType, overrideContainerHeight, appendToExisting) {
  switch(queryType) {

    case queryType.get_job_postings:
      getJobPostings(postingIds, sparqlEndPoint, outputDataType)
      break;

    case queryType.get_specified_skills:
      getSpecifiedSkills(postingIds, sparqlEndPoint, outputDataType)
      break;

    case queryType.get_extracted_skills:
      getExtractedSkills(postingIds, sparqlEndPoint, outputDataType)
      break;

    case queryType.get_location:
      getJobLocations(postingIds, sparqlEndPoint, outputDataType, offset, limit)// no locationAggregate - defaults to max detail
      break;

    case queryType.get_start_dates:
      getStartDates(postingIds, aggregate, sparqlEndPoint, outputDataType)
      break;

//    case queryType.get_industry_sector:
//      break;
  }
}

function parseValuesList(values, offset, limit) {
  var valuesAsStr = "";
  var count = 0;

  values.forEach(function (postingId) {
    if (offset === undefined)
      valuesAsStr += "<" + postingId + "> ";
    else if ((count <= (offset + limit)) && (count++ > offset))
      valuesAsStr += "<" + postingId + "> ";
  });
  //console.log(valuesAsStr);

  return valuesAsStr;
}

function parseQueryResults(parseFunction, queryResults, outputDataType, htmlElements) {
//console.log(parseFunction)
  if (Array.isArray(parseFunction)) {
    if (parseFunction.length == 2) {  // if need to check override
      //if (parseFunction[1] == previewOptions.table_preview)
        parseFunction = parseFunction[1]; // override default for this action
  //      else
  //        parseFunction = parseFunction[0];

    } else //if (parseFunction.length == 1)
      parseFunction = parseFunction[0];
  }
//console.log(parseFunction)

  switch(parseFunction) {
    case previewOptions.table_preview:
      buildDataHeaderSelector(queryResults.head.vars);
      storeLastParsedResults(defaultDataHeaders.jobPostingUri, queryResults, htmlElements);
      break;

    case queryType.get_extracted_skills:
      extractSkills(queryResults);
      break;


    case locationAggregate.city:
    case locationAggregate.region:
    case locationAggregate.country:
    case locationAggregate.coordinates:
      parseLocationQuery(parseFunction, queryResults);
      break;


    case queryType.filter_by_location:
      console.log("TBD", parseFunction);
      break;


    case queryType.filter_by_country:
      console.log("TBD", parseFunction);
      break;

    default:
      return runCustomParser(parseFunction, queryResults, outputDataType); // function must be implemented by caller
  }
}

function buildDataHeaderSelector(dataHeaders, panel, attributePanels) {
  var splitIndex = Math.ceil((dataHeaders.length - 1) / 2);

  var checkBox, header, label, delimiter;
  var labelPrefix = "dataHeader";
  if (!panel)
    panel = document.getElementById("dataAttributesSelector");
  if (!attributePanels || (attributePanels.length != 2)) {
    attributePanels = [];
    attributePanels[0] = document.getElementById("attrs_list1");
    attributePanels[1] = document.getElementById("attrs_list2");
  }

  for (var index in dataHeaders) {
    header = dataHeaders[index];

    checkBox = document.createElement("INPUT");
    checkBox.setAttribute("name", labelPrefix);
    checkBox.setAttribute("type", "checkbox");
    checkBox.setAttribute("value", labelPrefix + "_"  + header);
    (index <= splitIndex) ? attributePanels[0].appendChild(checkBox) : attributePanels[1].appendChild(checkBox);

    label = document.createTextNode(header);
    (index <= splitIndex) ? attributePanels[0].appendChild(label) : attributePanels[1].appendChild(label);

    delimiter = document.createElement("BR");
    (index <= splitIndex) ? attributePanels[0].appendChild(delimiter) : attributePanels[1].appendChild(delimiter);
  }

  panel.parentElement.style.display = "block";
}

function storeLastParsedResults(identifier, queryResults, htmlElements, dataStore) {

  var elements = htmlElements[htmlElements.length - 1];
  if (Array.isArray(elements) && (elements[0] == "show_hide_elements")) {
    document.getElementById(elements[1]).type = "submit";
    document.getElementById(elements[2]).style.display = "none";
    document.getElementById(elements[3]).style.display = "inline";
    document.getElementById(elements[3]).innerHTML = queryResults.results.bindings.length + " matches found";
    htmlElements.pop();
  }

  if (!dataStore)
    dataStore = document.getElementById("dataStore");
  dataStore.setAttribute("data", JSON.stringify((lastParsedResults = queryResults)));
  dataStore.setAttribute("identifier", identifier)
  dataStore.setAttribute("htmlElements", JSON.stringify(htmlElements));
}

function displayLastParsedResults(dataStore, attributePanels) {
  var labelPrefix = "dataHeader";
  var headerOptions = document.getElementsByName(labelPrefix);
  var dataHeaders = [];

  for (var index in headerOptions)
    if (headerOptions[index].checked)
      dataHeaders.push(headerOptions[index].value.substring(labelPrefix.length + 1));

  var drawTable = (dataHeaders.length > 0);
  if (!drawTable)
    drawTable = confirm("You must select at least one header to draw table! Draw all attributes?")

  if (drawTable) {  // tabulate
    if (!dataStore)
      dataStore = document.getElementById("dataStore");

    var queryResults = JSON.parse(dataStore.getAttribute("data"));
    var identifier = dataStore.getAttribute("identifier");
    var htmlElements = JSON.parse(dataStore.getAttribute("htmlElements"));
    if (dataHeaders.length == 0) {
      for (var index in headerOptions)
        headerOptions[index].checked = true;
      dataHeaders = queryResults.head.vars;
    }

////console.log("????", /*queryResults, identifier,*/ htmlElements, dataHeaders)
    var resultCount = queryResults.results.bindings.length;
    var currentResultPage = queryResults.results.bindings;
    if (resultCount > defaultPageCount) {
      setupToPageResults(true, resultCount, defaultPageCount);
      currentResultPage = queryResults.results.bindings.slice(currentPage, (currentPage + defaultPageCount + 1));
    }

    document.getElementById(htmlElements[0]).innerHTML = "";
    tabulate(identifier, currentResultPage, dataHeaders, "#" + htmlElements[0], false, true);
  }
}

function getJobPostings(postingIds, sparqlEndPoint, outputDataType, htmlElements, offset, limit) {

  var query = standard_queries.getJobPostingDetailQuery +
                  "VALUES ?jobPostingUri { " +  parseValuesList(postingIds, offset, limit) + " }" +
                "}" +
                "ORDER BY ?jobPostingUri ?skillUri";
  //console.log(query);

  runQuery(query, sparqlEndPoint, outputDataType, null, htmlElements, Object.keys(defaultDataHeaders));//, false);
}


/*
 * the next three filter queries take input and return
 * a matching list of postingIds or complete posting detail
 * for flag set to levelOfDetail.low (default)|full
 */
function filterByPostingDate(postingDate, timeRange, sparqlEndPoint, outputDataType, outputLevelOfDetail) {

  switch(timeRange) {
    case timeAggregate.week:
      break;

    case timeAggregate.month:
      break;

    case timeAggregate.quarter:
      break;

    case timeAggregate.year:
      break;

    case timeAggregate.day:
    default:
      break;
  }

}

function filterByLocation(outputOption, location, searchAggregate, sparqlEndPoint, outputDataType, limit, aggregateResultsBy, outputLevelOfDetail, nonStrictMatch) {

  switch(aggregateResultsBy) {
    case locationAggregate.city:
      query = ((outputLevelOfDetail == levelOfDetail.low) ? standard_queries.getJobPostingLocationLowDetailQuery : standard_queries.getJobPostingLocationQuery);
      break;

//    case region:
//      query = ((outputLevelOfDetail == levelOfDetail.low) ?  : standard_queries.);
//      break;

    case locationAggregate.country:
      query = ((outputLevelOfDetail == levelOfDetail.low) ? standard_queries.getJobPostingCountryLocationLowDetailQuery : standard_queries.getJobPostingCountryLocationQuery);
      break;

    case locationAggregate.coordinates:
      query = ((outputLevelOfDetail == levelOfDetail.low) ? standard_queries.getJobPostingLocationCoordsLowDetailQuery : standard_queries.getJobPostingLocationCoordsQuery);
      break;

    default:  //outputLevelOfDetail - redundant
      query = standard_queries.getJobPostingLocationDetailQuery;
  }

  var filterVariable;
  switch(searchAggregate) {
    case locationAggregate.city:
      filterVariable = "location";
      if (nonStrictMatch)
        query += "FILTER ((regex(str(?" + filterVariable + "), \"" + location + "\", \"i\")))";// || (regex(str(?jobLocation), \"" + location + "\", \"i\")))";
                  //"OPTIONAL { ?geoLocationUri geo:alternateName ?alternateNameEn . FILTER((langMatches(lang(?alternateNameEn), 'en')) && (regex(str(?alternateNameEn), \"" + location + "\", \"i\"))) } . ";
                  //"?geoLocationUri geo:alternateName ?alternateNameEn . FILTER((langMatches(lang(?alternateNameEn), 'en')) && (regex(str(?alternateNameEn), \"" + location + "\", \"i\"))) . ";
                  // @todo - need to include also altNames - return time is atrocious...
      break;

//    case region:
//      query += "FILTER (? = '" + location + "') ";
//      break;

    case locationAggregate.country:
      var regex = /^[A-Z]+$/;
      if ((location.length == 2) && (regex.test(location)))
        filterVariable = "countryCode";
      else
        filterVariable = "countryName";
      break;

    case locationAggregate.coordinates:
      filterVariable = "geoLocationUri";  // should be identical as exact match (for now...) so will sort on datePosted, but need to set to prevent breaking
      query += "FILTER ((?latitude = '" + location[0] + "') && (?longitude = '" + location[1] + "')) ";
      break;

//    default:  // @todo needs regex & an OR on all options
//      filterVariable = "";
//      query += "FILTER (? = '" + location + "') ";
  }

  if (searchAggregate != locationAggregate.coordinates) {
    if (!nonStrictMatch)  // default...
      query += "FILTER (?" + filterVariable + " = '" + location + "') ";
    else if (searchAggregate != locationAggregate.city)
      query += "FILTER regex(str(?" + filterVariable + "), \"" + location + "\", \"i\")";
                //"FILTER ((regex(str(?" + filterVariable + "), \"" + location + "\", \"i\")) && (regex(str(?jobTitle), \"analyst\", \"i\")))";
  }
  query +=  "} " +
            "ORDER BY ?" + filterVariable + " DESC(?datePosted)" +
            ((limit && (limit > 0)) ? (" LIMIT " + limit) : "");

  //console.log(query);

  var htmlElements = [];
  if (Array.isArray(outputOption) && (outputOption.length == 2)) {  // length WILL be 2, but play safe
    if (outputOption[0] == previewOptions.table_preview) {
      htmlElements.push(outputOption[1]);
      outputOption = outputOption[0];
    }
  }
  htmlElements.push(arguments[arguments.length - 1]);

  runQuery(query, sparqlEndPoint, outputDataType, [ queryType.filter_by_location, outputOption ], htmlElements);
}

function getJobLocations(postingIds, sparqlEndPoint, outputDataType, offset, limit, jobLocationAggregate) {
  var query;
//  if (!jobLocationAggregate)
//    query = standard_queries.getJobPostingLocationDetailQuery;

  switch(jobLocationAggregate) {
    case locationAggregate.city:
      query = standard_queries.getJobPostingLocationQuery;
      break;

//    case region:
//      query = standard_queries.;
//      break;

    case locationAggregate.country:
      query = standard_queries.getJobPostingCountryLocationQuery;
      break;

    case locationAggregate.coordinates:
      query = standard_queries.getJobPostingLocationCoordsQuery;
      break;

    default:
      query = standard_queries.getJobPostingLocationDetailQuery;
  }

  query +=    "VALUES ?jobPostingUri { " +  parseValuesList(postingIds, offset, limit) + " }" +
            "}";

  switch(jobLocationAggregate) {
    case locationAggregate.city:
      query += "ORDER BY ?jobPostingUri ?jobLocation";
      break;

//    case region:
//      query += "ORDER BY ?jobPostingUri ?";
//      break;

    case locationAggregate.country:
      query += "ORDER BY ?jobPostingUri ?countryName ?countryCode";
      break;

    default:  // detail query
      query += "ORDER BY ?jobPostingUri ?countryName ?jobLocation";
  }

  runQuery(query, sparqlEndPoint, outputDataType, jobLocationAggregate);
}

function filterLocationByCountryUri(outputOption, parentCountryUris, returnOnlyPostingsSpecifyingSkills, sparqlEndPoint, outputDataType/*, htmlElements*/) {

  var query = standard_queries.getJobLocationsForNamedCountryUriQuery +

                (returnOnlyPostingsSpecifyingSkills ? "?jobPostingUri edsa:requiresSkill ?skillUri . " : "OPTIONAL { ?jobPostingUri edsa:requiresSkill ?skillUri . } ") +
                  "VALUES ?parentCountryUri { " +  parseValuesList(parentCountryUris) + " }" +
                (returnOnlyPostingsSpecifyingSkills ? "FILTER (?skillUri != '')" : "") +  // shouldn't be necesary, but keeping on the off chance error in extraction
                "}" +
                "GROUP BY ?location ?geoLocationUri ?countryName ?parentCountryUri " +
                "ORDER BY ?countryName ?location ?geoLocationUri";

console.log(query)
  var htmlElements = [];
  if (Array.isArray(outputOption) && (outputOption.length == 2)) {  // length WILL be 2, but play safe
    if (outputOption[0] == previewOptions.table_preview) {
      htmlElements.push(outputOption[1]);
      outputOption = outputOption[0];
    }
  }

  var outputOptions = [ queryType.filter_by_country ];
  if (outputOption)
    outputOptions.push(outputOption);
  runQuery(query, sparqlEndPoint, outputDataType, outputOptions, htmlElements);
}

function filterPostingsByLocation(geoLocationUris, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getJobPostingDetailQuery +
          "VALUES ?geoLocationUri { " +  parseValuesList(geoLocationUris) + " }"  +
        "}" +
        "ORDER BY ?jobPostingUri ?countryName ?jobLocation ?location ?skillUri";

  runQuery(query, sparqlEndPoint, outputDataType, "filterPostingsByLocation", htmlElements);
}

function filterPostingsInGuidedSearch(parentCountryUri, geoLocationUri, skillUris, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getJobPostingUrisForGuidedSearchQuery +
        (geoLocationUri ?
          "FILTER (?geoLocationUri = <" + geoLocationUri + ">) " :
          "FILTER (?parentCountryUri = <" + parentCountryUri + ">) ") +
          ((!skillUris || (skillUris.length == 0)) ? "" : "VALUES ?skillUri { " +  parseValuesList(skillUris) + " }")  +
          "}" +
          //"GROUP BY ?geoLocationUri ?jobPostingUri ?skillUri ?datePosted" +
          "ORDER BY  DESC(?datePosted) ?jobPostingUri";

  runQuery(query, sparqlEndPoint, outputDataType, "filterPostingsInGuidedSearch", htmlElements);
}

function filterSearch(jobPostingUris, pageOffset, pageLimit, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getFilteredJobPostingsDetailQuery +
        "VALUES ?jobPostingUri { " +  parseValuesList(jobPostingUris, pageOffset, pageLimit) + " }"  +
         "}" +
         "ORDER BY ?datePosted ?jobPostingUri ?countryName ?jobLocation ?location ?skillUri";

console.log(query)
  runQuery(query, sparqlEndPoint, outputDataType, "filterSearch", htmlElements);
}
//
//function filterSearch(parentCountryUri, geoLocationUri, skillUris, sparqlEndPoint, outputDataType, htmlElements) {
//@todo - sort out AND filter
//  var query = standard_queries.getFilteredJobPostingsDetailQuery +
//        "FILTER ((?geoLocationUri = '" + geoLocationUri + "') && " +
//                "(?parentCountryUri = '" + parentCountryUri + "')) . " +
//
//         "VALUES ?skillUri { " +  parseValuesList(skillUris) + " }"  +
//         "}" +
//         "ORDER BY ?jobPostingUri ?countryName ?jobLocation ?location ?skillUri";
//
//console.log(query)
//  runQuery(query, sparqlEndPoint, outputDataType, "filterSearch", htmlElements);
//}

function parseLocationQuery(parseFunction, queryResults) {
}

function getStartDates(postingIds, aggregate, sparqlEndPoint, outputDataType) {
  sparqlEndPoint = constructSparqlQuery(query, sparqlEndPoint, outputDataType);
}

function filterSkillCount(parentCountryUris, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getSkillCountQuery +
                  (!parentCountryUris ? "" : "VALUES ?parentCountryUri { " + parseValuesList(parentCountryUris) + " } ") +
                "}";

  runQuery(query, sparqlEndPoint, outputDataType, "filterSkillCount", htmlElements);
}

function getSkillMention(parentCountryUris, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getSkillMentionQuery +
                  (!parentCountryUris ? "" : "VALUES ?parentCountryUri { " + parseValuesList(parentCountryUris) + " } \n") +
                "}\n" +
                "GROUP BY ?skillUri \n" +
                "ORDER BY DESC(?jobCount) ?skillUri\n";

  runQuery(query, sparqlEndPoint, outputDataType, "getSkillMention", htmlElements);
}

function filterBySkill(skills, sparqlEndPoint, outputDataType, outputLevelOfDetail, restrictToEncoded) {
  // restrictToEncoded flag set to true will return much more quickly, the alternative has to search through all descriptions

  var query = ((outputLevelOfDetail == levelOfDetail.low) ? standard_queries.getJobsRequiringSkillsLowDetailQuery : standard_queries.getJobsRequiringSkillsQuery);

  if (restrictToEncoded) {
    var edsaSkillPrefix = "http://www.edsa-project.eu/skill/";
    for (var i = 0; i < skills.length; i++) {
      if (!skills[i].startsWith(edsaSkillPrefix)) {
        skills[i] = edsaSkillPrefix.concat(skills[i].replace(/\s+/g, "_"));
        console.log("skill encoded", skills[i]);
      }
    }

    query += "VALUES ?skillUri { " +  parseValuesList(skills) + " }";
  } // end check for encoding
  else
    query += ""; // needs editing to regex

  query +=  "}" +
          "ORDER BY ?skillUri";

  runQuery(query, sparqlEndPoint, outputDataType, queryType.get_extracted_skills);
  console.log("lastParsedResults", lastParsedResults)

}

function filterLocationBySkill(filterUris, filterType, parentCountryUri, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getSkillsByLocationQuery +
                  (parentCountryUri ? ("FILTER (?parentCountryUri = <" + parentCountryUri + ">) . ") : "") +
                  "VALUES ?" + filterType + " { " +  parseValuesList(filterUris) + " }"  +
                "}" +
                "GROUP BY ?location ?skillUri ?geoLocationUri ?countryName " +
                "ORDER BY ?location DESC(?jobCount) ?skillUri";
  console.log("filterSkillsByLocation - query", query);

  runQuery(query, sparqlEndPoint, outputDataType, "filterLocationBySkill-" + filterType, htmlElements);
}

function filterSkillsByLocation(filterUris, filterType, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getSkillsByLocationQuery +
                  "VALUES ?" + filterType + " { " +  parseValuesList(filterUris) + " }"  +
                "}" +
                "GROUP BY ?location ?skillUri ?geoLocationUri ?countryName " +
                "ORDER BY ?location DESC(?jobCount) ?skillUri";
  console.log("filterSkillsByLocation - query", query);

  runQuery(query, sparqlEndPoint, outputDataType, "filterSkillsByLocation-" + filterType, htmlElements);
}

function getTotalSkillMentionByCountryQuery(parentCountryUris, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getTotalSkillMentionByCountryQuery +
                  (!parentCountryUris ? "" : "VALUES ?parentCountryUri { " + parseValuesList(parentCountryUris) + " } ") +
                "}" +
                "GROUP BY ?parentCountryUri ?countryName " +
                "ORDER BY DESC(?skillCount) ?countryName";
  //console.log(query);

  runQuery(query, sparqlEndPoint, outputDataType, "getTotalSkillMentionByCountry", htmlElements);
}

function filterSkillsByCountry(parentCountryUris, sparqlEndPoint, outputDataType, htmlElements) {

  var query = standard_queries.getSkillsByCountryQuery +
                  (!parentCountryUris ? "" : "VALUES ?parentCountryUri { " +  parseValuesList(parentCountryUris) + " } ") +
                "}" +
                "GROUP BY ?parentCountryUri ?countryName ?skillUri " +
                "ORDER BY DESC(?skillCount) ?countryName ?skillUri";

  runQuery(query, sparqlEndPoint, outputDataType, "filterSkillsByCountry", htmlElements);
}

function getSpecifiedSkills(postingIds, sparqlEndPoint, outputDataType) {

  var query = standard_queries.getSpecifiedSkillsQuery +
                  "VALUES ?jobPostingUri { " + parseValuesList(postingIds) + " }" +
                "}" +
                "ORDER BY ?skillUri";
  //console.log(query);

  sparqlEndPoint = constructSparqlQuery(query, sparqlEndPoint, outputDataType);

  var specifiedSkills = [];

  postingIds.foreach(function (postingId) {
  });
}

function getExtractedSkills(postingIds, sparqlEndPoint, outputDataType, offset, limit) {
  var query = standard_queries.getJobPostingDescriptionQuery +
                  "VALUES ?jobPostingUri { " +  parseValuesList(postingIds, offset, limit) + " }" +
                "}" +
                "ORDER BY ?jobPostingUri ?skillUri";

  runQuery(query, sparqlEndPoint, outputDataType, queryType.get_extracted_skills);
  console.log("lastParsedResults", lastParsedResults)
}

function extractSkills(queryResults) {
  var jobTitle, jobDescription;
  var extractedSkills = new Map();
  var matchFound;
  //console.log(queryResults.results.bindings)

  queryResults.results.bindings.forEach(function(jobPosting) {
    jobTitle = jobPosting.jobTitle.value;
    jobDescription = jobPosting.description.value;

    matchFound = runMatcher(jobDescription);
    if (matchFound)
      matchFound = d3.set(matchFound).values();
    //console.log(jobPosting.jobPostingUri.value, jobDescription, matchFound)


    extractedSkills.set(jobPosting.jobPostingUri.value, matchFound);
  });

  return lastParsedResults = extractedSkills;;
}

function runMatcher(input, skills) {
  if (!skills & !predefinedSkills)
    predefinedSkills = parseSkillList();
  if (!skills)
    skills = predefinedSkills;
  else //parse skills array...
    skills = parseSkillList(skills);

  //console.log(input);
  var regex = new RegExp("\\b(" + skills + ")\\b", "gmi");
  return input.match(regex);
}

function parseSkillList(skillList) {
  if (!skillList)
    skillList = predefined_skills; // generate from list in skill_set_selector.js

  var parsedSkills = "";
  d3.values(skillList).forEach(function (skill) {
    parsedSkills += skill + "|";
  });

  return (parsedSkills.substring(0, parsedSkills.lastIndexOf("|")));
}

function setupToPageResults(enable, resultCount, pageCount, pagingFunction) {
  currentPage = 0;

  if (enable) {
    document.getElementById("currentPage").innerHTML = 1;
    lastPage = Math.ceil(resultCount / pageCount);
    document.getElementById("lastPage").innerHTML = lastPage;
  }

  if (!pagingFunction) {  // defaults...
    document.getElementById("previousButton").setAttribute("onclick", "getPreviousPage(); return false;");
    document.getElementById("nextButton").setAttribute("onclick", "getNextPage(); return false;");

  } else {
    document.getElementById("previousButton").setAttribute("onclick", "getPreviousPage('" + pagingFunction + "'); return false;");
    document.getElementById("nextButton").setAttribute("onclick", "getNextPage('" + pagingFunction + "'); return false;");
  }

  // show/hide div
  document.getElementById("previousPageButton").style.visibility = "hidden";
  document.getElementById("nextPageButton").style.visibility = (enable ? "visible" : "hidden");
  document.getElementById("resultsPager").style.display = (enable ? "inline-block" : "display: none;");
}

function pageResults(pageNumber, pageCount) {
  var labelPrefix = "dataHeader";
  var headerOptions = document.getElementsByName(labelPrefix);
  var dataHeaders = [];

  for (var index = 0; index < headerOptions.length; index++) { // var-in breaks after the final here - don't ask, I haven't figured that one out yet :S
    if (headerOptions[index].checked)
      dataHeaders.push(headerOptions[index].value.substring(labelPrefix.length + 1));
  }


  var drawTable = (dataHeaders.length > 0);
  if (!drawTable)
    drawTable = confirm("You must select at least one header to draw table! Draw all attributes?")

  if (!drawTable)
    return;


  var queryResults = JSON.parse(dataStore.getAttribute("data"));
  var identifier = dataStore.getAttribute("identifier");
  var htmlElements = JSON.parse(dataStore.getAttribute("htmlElements"));
  if (dataHeaders.length == 0) {
    for (var index in headerOptions)
      headerOptions[index].checked = true;
    dataHeaders = queryResults.head.vars;
  }


  currentPage = pageNumber - 1;
  var limit = (pageNumber * pageCount);
  if (limit > queryResults.results.bindings.length)
    limit = queryResults.results.bindings.length;

  document.getElementById(htmlElements[0]).innerHTML = "";
  tabulate(identifier, queryResults.results.bindings.slice((currentPage * pageCount), (limit + 1)), dataHeaders, "#" + htmlElements[0], false, true);

  document.getElementById("currentPage").innerHTML = (currentPage + 1);
  document.getElementById("nextPageButton").style.visibility = ((currentPage == (lastPage - 1)) ? "hidden" : "visible");
  document.getElementById("previousPageButton").style.visibility = ((currentPage == 0) ? "hidden" : "visible");
}

function completePaging(identifier, currentPageData, dataHeaders, htmlElements) {
  document.getElementById(htmlElements[0]).innerHTML = "";
  tabulate(identifier, currentPageData, dataHeaders, "#" + htmlElements[0], false, true);

  document.getElementById("currentPage").innerHTML = (currentPage + 1);
  document.getElementById("nextPageButton").style.visibility = ((currentPage == (lastPage - 1)) ? "hidden" : "visible");
  document.getElementById("previousPageButton").style.visibility = ((currentPage == 0) ? "hidden" : "visible");
}

function getNextPage(pagingFunction) {  //currentPageData, dataHeaders, identifier, htmlElements) {
  if (!pagingFunction)
    pageResults((currentPage + 2), defaultPageCount);
  else  // function must be implemented by caller
    runCustomPagingFunction(pagingFunction, (currentPage + 2), defaultPageCount, completePaging);//currentPageData, dataHeaders, identifier, (currentPage + 2), htmlElements);
}

function getPreviousPage(pagingFunction) {  //currentPageData, dataHeaders, identifier, htmlElements) {
  if (!pagingFunction)
    pageResults(currentPage, defaultPageCount);
  else
    runCustomPagingFunction(pagingFunction, currentPage, defaultPageCount, completePaging);//currentPageData, dataHeaders, identifier, currentPage, htmlElements);
}

function jumpToPage(pageNumber) {

  if (pageNumber > lastPage)
    pageNumber = lastPage;
  if (pageNumber < 1)
    pageNumber = 1;

}

function setContentType(type) { // suddenly started not being happy with the identical value being read in as a string, single or double quoted...
                                // even this now breaking :S
  if ((type == null) || (type.trim().length == 0))
    type = contentType.json;

  switch(type) {
    case contentType.text:
      type = contentType.text;
      break;

    case contentType.xml:
      type = contentType.xml;
      break;

    case contentType.csv:
      type = contentType.csv;
      break;

    case contentType.tsv:
      type = contentType.tsv;
      break;

    case contentType.json:
    default:
      type = contentType.json;
  }

  return "application/" + type;
}

function constructSparqlQuery(query, sparqlEndPoint, outputDataType, styleSheet) {
  if ((sparqlEndPoint == null) || (sparqlEndPoint.length == 0))
    sparqlEndPoint = defaultLocalEndPoint;//defaultRemoteEndPoint;//
  if ((styleSheet == null) || (styleSheet.length == 0))
    styleSheet = defaultStyleSheet;
  if ((outputDataType == null) || (outputDataType.length == 0))
    outputDataType = contentType.json;

  //http://localhost:3030/DB/edsa/query?query=queryAsString&output=json&stylesheet=
  console.log(sparqlEndPoint + encodeURIComponent(query) + "&output=" + outputDataType + "&stylesheet=" + styleSheet);
  return (sparqlEndPoint + encodeURIComponent(query) + "&output=" + outputDataType + "&stylesheet=" + styleSheet);
}

function formatResults() {
}
