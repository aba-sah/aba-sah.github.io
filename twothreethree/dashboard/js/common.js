var euMemberStatus = {  EU : "EU",
                        EEA : "EEA",
                        EFTA : "EFTA",
                        EUCX : "EUCX",  // not EU but bound by Customs & Excise or border control or similar
                        CANDIDATE : "CANDIDATE",
                        POTENTIAL_CANDIDATE : "POTENTIAL_CANDIDATE",
                        NONE : "NONE",  // generally left blank or set to null
                        }

var euXMemberStatesGeonamesIds = {  Aland : "http://sws.geonames.org/661882/",
                                    Andorra : "http://sws.geonames.org/3041565/",
                                    Austria : "http://sws.geonames.org/2782113/",
                                    Belgium : "http://sws.geonames.org/2802361/",
                                    Bulgaria : "http://sws.geonames.org/732800/",
                                    Croatia : "http://sws.geonames.org/3202326/",
                                    Cyprus : "http://sws.geonames.org/146669/",
                                    Czech_Republic : "http://sws.geonames.org/3077311/",
                                    Denmark : "http://sws.geonames.org/2623032/",
                                    Estonia : "http://sws.geonames.org/453733/",
                                    Faroe_Islands : "http://sws.geonames.org/2622320/",
                                    Finland : "http://sws.geonames.org/660013/",
                                    France :  "http://sws.geonames.org/3017382/",
                                    Gibraltar : "http://sws.geonames.org/2411586/",
                                    Germany : "http://sws.geonames.org/2921044/",
                                    Greece :  "http://sws.geonames.org/390903/",
                                    Hungary : "http://sws.geonames.org/719819/",
                                    Iceland : "http://sws.geonames.org/2629691/",
                                    Ireland : "http://sws.geonames.org/2963597/",
                                    Italy : "http://sws.geonames.org/3175395/",
                                    Latvia : "http://sws.geonames.org/458258/",
                                    Liechtenstein : "http://sws.geonames.org/3042058/",
                                    Lithuania : "http://sws.geonames.org/597427/",
                                    Luxembourg : "http://sws.geonames.org/2960313/",
                                    Malta : "http://sws.geonames.org/2562770/",
                                    Monaco : "http://sws.geonames.org/2993457/",
                                    Netherlands : "http://sws.geonames.org/2750405/",
                                    Norway : "http://sws.geonames.org/3144096/",
                                    Poland : "http://sws.geonames.org/798544/",
                                    Portugal : "http://sws.geonames.org/2264397/",
                                    Romania : "http://sws.geonames.org/798549/",
                                    San_Marino : "http://sws.geonames.org/3168068/",
                                    Slovakia : "http://sws.geonames.org/3057568/",
                                    Spain : "http://sws.geonames.org/2510769/",
                                    Sweden : "http://sws.geonames.org/2661886/",
                                    United_Kingdom : "http://sws.geonames.org/2635167/",
                                    Slovenia : "http://sws.geonames.org/3190538/",
                                    Svalbard_and_Jan_Mayen : "http://sws.geonames.org/607072/",
                                    Switzerland : "http://sws.geonames.org/2658434/",
                                    Vatican_City : "http://sws.geonames.org/3164670/",
                                    }

var colourCodes = { jobs : "red",
                    Country_Percentage: "black",
                    Skills_Percentage: "olive",
//                    regionCount: "steelblue",
                    trendColourA : "#d93d66", //Rose pink //#21637d", //730100"; // magenta
                    trendColourB : "#ff815e",  //Orange
                    trendColourC : "#458c7f",  //Green

                    lato_dark_blue1 : "#21637d",
                    lato_dark_blue2 : "#4d8297",
                    lato_dark_blue5 : "#a6c1cb",
                    lato_dark_blue6 : "#d3e0e5",
                    colourMeInactive : "#b5b5b5",//dadada", //dce2e2",// //",lightgrey"

                  };

var parseJobCountOptions = {  linear_complete : 0,
                              linear_by_skill : 1,
                              linear_by_date : 2,
                              log_complete : 3,
                              log_by_skill : 4,
                              log_by_date : 5
                            };

// with gaps to allow intermediate points
var levelOfDetail = { distant : 10,
                      low : 12,
                      medium : 14,
                      high : 16,
                      full : 18
                    };

var frameWidth = -1,
    frameHeight = 1300,
    filterPanelWidth = 355;


//
//    var colourCodesLib = d3.scale.ordinal()
//                            .range(d3.merge([
////                                    colorbrewer.RdYlBu[7],
////                                    colorbrewer.Pastel1[8],
//                                    colorbrewer.Spectral[11],
//                                    colorbrewer.Accent[8],
////                                    colorbrewer.RdYlGn[11],
//                                  ]))
//                            .domain(colourCodesDomain);



function initWindowSize(margin, width, height) {

  var resizedWindow = resizeWindow(width, height);
  if (resizedWindow) {
    width =  resizedWindow[0];
    height = resizedWindow[1];
  }


  var minWidth = 400; // beyond this force scrolling

  var windowWidth = window.innerWidth,
      windowHeight = window.innerHeight,
      marginHeight = margin.top + margin.bottom;

  if (frameWidth < 0)
    frameWidth = 0.95 * windowWidth;  // set at 100% - need margin
  if (width > (frameWidth - filterPanelWidth)) // ignore height - will scroll vertically
    width = 0.98 * (frameWidth - filterPanelWidth);
  else if (width < ((frameWidth - filterPanelWidth - 100)))
    width = 0.95 * (frameWidth - filterPanelWidth);
  console.log("frameWidth: " + frameWidth + ", " + frameHeight);
  console.log("width: " + width + ", " + height);
  if (width < minWidth)
    width = minWidth;

  height = 0.55 * width;  //.65 //.35 //0.05
  if ((height < (0.85 * (windowHeight - marginHeight))) || (height > (0.90 * (windowHeight - marginHeight))))
    height = 0.85 * (windowHeight - marginHeight);
}

function filterByCountryPercentage(key, threshold, data) {
  var slice = data.filter(function(coordinate) {
                      if (coordinate.Country_Percentage >= threshold)
                        return coordinate;
                    }).sort(function(a, b) {
                      return (b.Country_Percentage > a.Country_Percentage);
                    });

  var returnValue,  // keeps iterating past this...
      count = 0;

  slice.forEach(function (jobSet) {
    if (!returnValue && (key === jobSet.Country_Percentage))
      returnValue = slice.length - count;
    count++;
  });

  return (!returnValue ? "" : returnValue);
}

function filterBySkillsPercentage(key, threshold, data) {
  var slice = data.filter(function(coordinate) {
                      if (coordinate.Skills_Percentage >= threshold)
                        return coordinate;
                    }).sort(function(a, b) {
                      return (b.Skills_Percentage > a.Skills_Percentage);
                    });

  var returnValue,
      count = 0;

  slice.forEach(function (jobSet) {
    if (!returnValue && (key === jobSet.Skills_Percentage))
      returnValue = slice.length - count;
    count++;
  });

  return (!returnValue ? "" : returnValue);
}


function printOutLastSelection(output, divId) {
  output = //",<p>&nbsp;</p><p style='font-size: 1.4em; margin-left: 1em;'>Last Selection</p>" +
    "<span style='font-size: 1.3em; margin-left: 4em;'>" +  output + "</span>";
  document.getElementById("" + divId + "").innerHTML = output;

  location.href = "#" + divId;
}
