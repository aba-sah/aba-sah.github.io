/** adapted from https://bost.ocks.org/mike/miserables */

var margin = {top: 150, right: 60, bottom: 10, left: 150},
    width = +d3.select("svg").attr("width") * 2,
    height = +d3.select("svg").attr("height") * 2;

//
//var svg = d3.select("svg")  // breaks if define svg separately ?????
//              .attr("width", width + margin.left + margin.right)
//              .attr("height", height + margin.top + margin.bottom)
//              .style("margin-top", "15px")
//              .style("margin-left", "15px")
//              .style("margin-right", margin.right + "px")
//            .append("g")
//              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//



var networkPane = "network";
var svgDN = d3.select("#" + networkPane)
              .append("svg");

var matrixMargin = {top: 100, right: 35, bottom: 10, left: 120};
var matrixPane = "matrix";
var svgDM = d3.select("#" + matrixPane)
              .append("svg");
svgDM.attr("width", width)
      .attr("height", height)
      .style("margin-left", -matrixMargin.left + "px")
      .style("margin-top", -matrixMargin.top + "px")

var xmScale = d3.scaleBand()
                .range([0, width - matrixMargin.left - matrixMargin.right]),
    zmScale,
    zmdScale;
var colourScale = d3.schemeCategory10;//d3.scaleOrdinal(colourSelector);//
var encodingVar,
    maxLinkWeight,
    defaultDistance = 10,
    linkWidthWeightingScale,
    linkDistanceWeightingScale;


var nodeRadius = 3; // default
var defaultTreeDepth = 1;
var shiftKeyDown;

var graph,
    links,
    hiddenLinks,
    root,
    radius,
    nodeIndexLookUp = new Map(),
    indexToNodeLookup = new Map();
var organisation_schema,
    focusOrganisation,
    selectedOrganisations = [];

var simulation = d3.forceSimulation()
                    .force("link", d3.forceLink()
                                      .id(function(d) { return d.identifier; })
                                      .distance(linkDistance)//function(d) { return 75; })//(d.weight * 20); })
                                      //.strength(0.1)
                          )
                    .force("charge", d3.forceManyBody())
                    .force("center", d3.forceCenter(width/4, height/4));


var kpis,
    kpisAvailable = [],  // prevent error for the cases ends up empty- shdn't happen but useful for debugging stages
    standardKpiLabels /*= { network: "contact count",
                          similarity: "best match", // distance inverted
                          geo_distance: "distance from plant",
                          feedstock_type: "feedstock type", // closeness to selected plant
                          weighted_kpi: "KPI",  // @todo - random weighting for demo//weighted cost
                          selected_node: "best fit, focus"
                          }*/,
    kpiOptionGroups = [],

    defaultMatrixOrder = "network",
    defaultMatrixOrdering,
    currentMatrixOrder = null;
var selectedNodeIndex;
var failsMatch = "failsMatch",
    hideNonMatches = false,
    fadeNonMatches = true;

var matrix = [],
    geo_distance_matrix = [];
var geo_distances;
var kpiOptionsUI;
var focusKpis, valueCategories, focusKpiCategories;

var node = svgDN.selectAll(".node"),
    link = svgDN//.append("g")
              .selectAll(".link");

//var runUpdate, triggerAction;
//var graphUpdateStart, nodeCount;
//var linkWidthWeightingScale;
//
//
// defaults with switch options
var drawIcons = false, //true,
    drawLabels = false,
    encodeLinks = false;

//var baseUri;

var subNetworkHubs;
var codedVars = [],
    legendSpace;
var fadeNonRoi;

function drawLegend() {
//console.log("legend", codedVars)

  var legendSpace = codedVars.length * 2.5;

  var lSvg = d3.select("#legend")
                .append("svg")
                .attr("width", 250)
                .attr("height", legendSpace * 6)
                .append("g")
                .attr("transform", "translate(" + (0) + "," + (0) + ")");

  var legend = lSvg.selectAll(".legend")
                    .data(codedVars)
                    .enter().append("g");

  legend.append("path")
          .attr("id", function(d) { return d; })
          .attr("d", d3.symbol()
                        .type(d3.symbolCircle)
                        .size(30)
          )
          .attr("transform", function(d, i) { return "translate(" +
                                                        (margin.right/5) + "," +
                                                        (legendSpace + i * legendSpace - 4) + ")"; })

          .style("fill", function(d) { return colourScale[codedVars.indexOf(d)]; })
          .style("stroke", function(d) { return colourScale[codedVars.indexOf(d)]; })
//          .style("opacity", function(d) {
//            if (!contains(recordedActivityTypes, d))
//              return 0.35;
//          })
          .attr("class", "legend-box")
//          .style("pointer-events", function(d) {
//            if (!contains(recordedActivityTypes, d))
//              return "none";
//          })
//          .append("title")
//            .text(function(d) {
//             return "Click to filter on '" + d.replace(/_/g, " ") + "' events";
//            })
//
  // legend ...
  legend.append("text")
        .attr("x", margin.right/3)
        .attr("y", function (d, i) { return (legendSpace + (i * legendSpace) - 1); }) // replace with better calculation, pref using function....
        .style("font-size", "0.85em")
        .text(function(d) { return splitCamelOrPascalCase(d); });
}

function generateMatrix(treeDepth, baseUri, identifier, encodingVariable, hub, networkData) {

  graph = [];
  links = [];
  hiddenLinks = [];
  subNetworkHubs = new Map();

  root = {  "identifier" : hub.identifier,
            "CompanyName" : (hub.name ? hub.name : (hub.CompanyName ? hub.CompanyName : hub.identifier)),
            "PrimaryContact" : hub.contact,
            "OrganisationType" : "TBC",
            "PrimarySiteGeonamesID" : "TBC",
            "RegistrationDate" :"TBC",
          };
  var count = addNodeToGraph(root, null);

/*
        "identifier": "fc37c4e23a31",
        "CompanyUri": "http://www.abs-ebri-project.uk/companyId/fc37c4e23a31/EBRI",
        "CompanyName": "EBRI",
        "RegistrationDate": "2012-01-05T10:00:00+00:00",
        "PrimarySiteGeonamesID": "6619732",
        "OrganisationType": "Hub",

*/

}

function loadData(treeDepth, baseUri, identifier, encodingVariable, networkDataFile, supplementaryFiles, fileLoadOrder,
                    plotNetwork, plotMatrix, drawDataLabels, drawDataIcons, hideNodesOnFailSearch, fadeNodesOnFailSearch) {

  var metadataIds = [ "networkDataFile" ];
  var dataQueue = d3.queue();
  dataQueue.defer(d3.json, dataFile);

  var fileExtension;
  for (var i in fileLoadOrder)
    if (supplementaryFiles.has(fileLoadOrder[i])) {

      fileExtension = supplementaryFiles.get(fileLoadOrder[i]).replace(/^.*\./, '');

      if (fileExtension == "json")
        dataQueue.defer(d3.json, supplementaryFiles.get(fileLoadOrder[i]));
      else if (fileExtension == "csv")
        dataQueue.defer(d3.csv, supplementaryFiles.get(fileLoadOrder[i]));
      else if (fileExtension == "tsv")
        dataQueue.defer(d3.tsv, supplementaryFiles.get(fileLoadOrder[i]));
      else if (fileExtension == "txt")
         dataQueue.defer(d3.text, supplementaryFiles.get(fileLoadOrder[i]));

      metadataIds.push(fileLoadOrder[i]);
    }

  dataQueue.awaitAll(function(error, loadedData) {
    if (error)
      console.error(error);

    parseSupplementaryData(loadedData, metadataIds);
    parseNetworkDataFile(loadedData, metadataIds, treeDepth, baseUri, identifier, encodingVariable,
                          plotNetwork, plotMatrix, drawDataLabels, drawDataIcons, hideNodesOnFailSearch, fadeNodesOnFailSearch);
  });
}

function parseSupplementaryData(loadedData, metadataIds) {

  var value, category;

  metadataIds.forEach(function(key) {

    switch(key) {
      case "kpis":
        kpis = (data = loadedData[metadataIds.indexOf(key)]);
        focusKpis = {};
        valueCategories = {};
        focusKpiCategories = data.focusKpiCategories;
        standardKpiLabels = data.standardKpis;

        Object.keys(kpis.kpiGroups).forEach(function(key) {
          if (kpis[kpis.kpiGroups[key]]) {
            if (key == "all")
              kpiOptionGroups[key/*kpis.kpiScope[key]*/] = kpis[kpis.kpiGroups[key]];  // @todo - breaks if call Object.keys, but prints fine...
//console.log("kpis - groups1", key, kpis.kpiGroups[key], kpis.kpiScope[key], Object.keys(kpis[kpis.kpiGroups[key]]));//, Object.keys(kpis[key]));
          }
        });

        Object.keys(data.focusKpis).forEach(function(key) {
          value = data.focusKpis[key];
          focusKpis[key] = value.label;

          for (var i in value.value_category) {
            if ((category = value.value_category[i].trim()).length == 0)
              continue;

            if (Object.keys(valueCategories).indexOf(category) == -1)
              valueCategories[category] = [ key ];
            else
              valueCategories[category].push(key);

          } // end for
        });

//console.log("kpis - all", focusKpis, valueCategories, focusKpis, focusKpiCategories, kpis);
        break;

      case "geo_distances":
        geo_distances = loadedData[metadataIds.indexOf(key)];
        break;

      case "organisation_schema":
        organisation_schema = loadedData[metadataIds.indexOf(key)];
console.log("organisation_schema", organisation_schema);
        break;

      default:
        ; // do nothing
    }
  });
}

function parseNetworkDataFile(loadedData, metadataIds, treeDepth, baseUri, identifier, encodingVariable, plotNetwork, plotMatrix, drawDataLabels, drawDataIcons, hideNodesOnFailSearch, fadeNodesOnFailSearch) {

  encodingVar = encodingVariable;
  subNetworkHubs = new Map();

  networkData = loadedData[metadataIds.indexOf("networkDataFile")];
  initGraph(false, "uri");

  graph = networkData.nodes,
  links = networkData.links,
  hiddenLinks = [],
  networkSize = graph.length;
  var weights = [];

  graph.forEach(function(node) {
    matrix[node.index] = d3.range(networkSize).map(function(j) { return { x: j, y: node.index, z: 0}; });
    geo_distance_matrix[node.index] = d3.range(networkSize).map(function(j) { return { x: j, y: node.index, z: 0}; });

    nodeIndexLookUp.set(node.identifier, node.index);
    if (node.RegistrationDate && (node.RegistrationDate.trim().length > 0))
      node.RegistrationDate = new Date(node.RegistrationDate);
    else if (!node.RegistrationDate) // catch empty strings...
      node.RegistrationDate = undefined;

    if (node.InputFeedstock) {
      for (var i in node.InputFeedstock) {
        if (node.InputFeedstock[i].PreferredFeedstock) {
          node.PreferredFeedstock = node.InputFeedstock[i].WasteType;
          break;
        }
      }
    } // end if - checking feedstock consumers

    node.failsMatch = new Map();
    node.NetworkConnections = 0;

    if (node.OrganisationType == "Hub")
      root = node;
    else {
      if (!subNetworkHubs.has(node.OrganisationType))
        subNetworkHubs.set(node.OrganisationType, new Set());
      subNetworkHubs.get(node.OrganisationType).add(node.identifier);
    }

    codedVars.push(node[encodingVar]);  //splitCamelOrPascalCase
  });
  geo_distances.forEach(function(distance_node) {
    graph[nodeIndexLookUp.get(distance_node.identifier)]["geo_distances"] = distance_node;
    //console.log("geo_distances2", distance_node.identifier, graph[nodeIndexLookUp.get(distance_node.identifier)], distance_node[distance_node.identifier], distance_node["hub_fc37c4e23a31"], distance_node);
  });

  var currentLinkTarget;
  links.forEach(function(link) {
    weights.push(link.weight);

    matrix[nodeIndexLookUp.get(link.source)][nodeIndexLookUp.get(link.target)].z = link.weight;
//      matrix[nodeIndexLookUp.get(link.target)][nodeIndexLookUp.get(link.source)].z = link.weight;
    matrix[nodeIndexLookUp.get(link.source)][nodeIndexLookUp.get(link.source)].z += 1;
    matrix[nodeIndexLookUp.get(link.target)][nodeIndexLookUp.get(link.target)].z += 1;
    graph[nodeIndexLookUp.get(link.source)].NetworkConnections += 1;
    graph[nodeIndexLookUp.get(link.target)].NetworkConnections += 1;

    //console.log("geo_distances - link", link.source, link.target)

    if (link.source == root.identifier)
      hiddenLinks.push(link);

      if (!((currentLinkTarget = graph[nodeIndexLookUp.get(link.target)]).RegistrationDate)) {
        console.log("Registration date missing for node connected to hub. Set to 1970", link.target);
        currentLinkTarget.RegistrationDate = new Date(0);
      }
      // causes issues when purged here...
  });
  hiddenLinks.forEach(function(link) {
    //console.log("removing core hub links", link.source, link.target)
    links.splice(links.indexOf(link), 1);
  });
//console.log("root link?", root.identifier, hiddenLinks, links, matrix)


  codedVars = d3.set(codedVars).values();
  if (links.length > 0)
    maxLinkWeight = (d3.max(weights) + 1);
  if (!maxLinkWeight) { // no links defined
    maxLinkWeight = 1;
    defaultDistance = 30;
  }


  console.log("read test", defaultDistance, maxLinkWeight, root, graph, links, matrix, d3.max(weights), d3.extent(weights));

  drawIcons = drawDataIcons;
  drawLabels = drawDataLabels;
  hideNonMatches = (hideNodesOnFailSearch ? hideNodesOnFailSearch : hideNonMatches);
  fadeNonMatches = (fadeNodesOnFailSearch ? fadeNodesOnFailSearch : fadeNonMatches);
  if (plotNetwork || plotMatrix)
    drawLegend();
  if (plotMatrix)
    drawMatrix(weights);
  if (plotNetwork)
    drawNetwork(weights);

//    d3.select("#kpiOptions")
//        .append("select")
//        .attr("id", "kpiOptionsSelector")
//      .select("#kpiOptionsSelector");


  var origin = {lat: 55.93, lng: -3.118};
  var destination = {lat: 50.087, lng: 14.421};
  origin = {lat: 52.485, lng: -1.889};
  destination = {lat: 52.49163, lng: -1.8596};

//runGoogleMapsDistanceMatrixQuery(52.485, -1.889, 52.49163, -1.8596, "AIzaSyBEc6faYzovaPMbtYfZgdMF8sNXv-Q3sv4");
}

function drawMatrix(weights) {

//  if (threshold?)
//    zmScale = d3.scaleLog();
                //;
//  else
    zmScale = d3.scaleLinear()
//                .clamp(true);

  zmScale.range([0.1, 4])
          .domain(d3.extent(weights));

  zmdScale = d3.scaleLinear()
                .range([0.1, 4])
                .domain(d3.extent(graph.reduce(function(a, b) { return a.concat(b.NetworkConnections); }, [])));


  var networkSize = graph.length;

  kpisAvailable = {

    network: d3.range(networkSize).sort(function(a, b) {
                    graph[a].failsMatch.set(standardKpiLabels.network, false);
                    graph[b].failsMatch.set(standardKpiLabels.network, false);

                    // reverse sort
                    return ((graph[a].NetworkConnections < graph[b].NetworkConnections) ? 1 :
                              ((graph[a].NetworkConnections == graph[b].NetworkConnections) ? 0 : -1));
                  }),
//    similarity: d3.range(networkSize).sort(function(a, b) { // @todo - needs to be to a specified node
//                graph[a].failsMatch.set(similarity, false);
//                graph[b].failsMatch.set(similarity, false);
//    console.log("?m", matrix[a], matrix[b], graph[a], graph[b])
////                  return ();
//                }),
    environmental_emissions: d3.range(networkSize).sort(function(a, b) {
                    return ((graph[a].carbon_levy < graph[b].carbon_levy) ? -1 :
                              ((graph[a].carbon_levy == graph[b].carbon_levy) ? 0 : 1));
                  }),
//    feedstock_type: d3.range(networkSize).sort(function(a, b) { // @todo - needs to be to a specified node
//                    }),
//    feedstock_quantity: d3.range(networkSize).sort(function(a, b) {
//                        }),

    feedstock_delivery_frequency: d3.range(networkSize).sort(function(a, b) { // dud - to give a demo value
                    var shortestDeliveryCycleA = (graph[a].Feedstock ? getShortestMeanDeliveryCycle(graph[a].Feedstock) : 100),
                        shortestDeliveryCycleB = (graph[b].Feedstock ? getShortestMeanDeliveryCycle(graph[b].Feedstock) : 100);
                    graph[a].failsMatch.set(standardKpiLabels.feedstock_delivery_frequency, (shortestDeliveryCycleA == 100));
                    graph[b].failsMatch.set(standardKpiLabels.feedstock_delivery_frequency, (shortestDeliveryCycleB == 100));

                    if ((shortestDeliveryCycleA == shortestDeliveryCycleB) && (shortestDeliveryCycleA == 100))
                      return ((graph[a].NetworkConnections < graph[b].NetworkConnections) ? 1 :
                              ((graph[a].NetworkConnections == graph[b].NetworkConnections) ? 0 : -1));
                      //return (graph[b].NetworkConnections - graph[a].NetworkConnections);

                    return ((shortestDeliveryCycleA < shortestDeliveryCycleB) ? -1 :
                              ((shortestDeliveryCycleA == shortestDeliveryCycleB) ? 0 : 1));
                  }),

    weighted_kpi: d3.range(networkSize).sort(function(a, b) {
                    var tmp;
                    graph[a].failsMatch.set(standardKpiLabels.weighted_kpi, false);
                    graph[b].failsMatch.set(standardKpiLabels.weighted_kpi, false);

                    var weightsA = graph.reduce(function(result, j) {
                                            tmp = matrix[j.index][a].z;
                                            return ((tmp == 0) ? result : result.concat(tmp));
                                          }, []),
                        weightsB = graph.reduce(function(result, j) {
                                            tmp = matrix[j.index][b].z;
                                            return ((tmp == 0) ? result : result.concat(tmp));
                                          }, []);
                    var weightedMeanA = ((weightsA.length > 0) ? d3.mean(weightsA) : 0),
                        weightedMeanB = ((weightsB.length > 0) ? d3.mean(weightsB) : 0);

                    return ((weightedMeanB < weightedMeanB) ? 1 :
                              ((weightedMeanB == weightedMeanB) ? 0 : -1));
                  }),

//    selected_node: d3.range(networkSize).sort(function(a, b) {
//                    graph[a].failsMatch.set(standardKpiLabels.selected_node, false);
//                    graph[b].failsMatch.set(standardKpiLabels.selected_node, false);
//
//                    // default - network strenth - will udate with selection
//                    return ((graph[a].NetworkConnections < graph[b].NetworkConnections) ? 1 :
//                              ((graph[a].NetworkConnections == graph[b].NetworkConnections) ? 0 : -1));
//                  }),
  }
  defaultMatrixOrdering = kpisAvailable[defaultMatrixOrder];

//  plotMatrix(graph, matrix, kpisAvailable);
//}
//
//function plotMatrix(graph, matrix, kpisAvailable) {

  // need to clear here
  d3.selectAll(".row")
    .remove();
  d3.selectAll(".column")
    .remove();


//  if (currentMatrixOrder) {
//    if ((currentMatrixOrder == "interactionCount") || currentMatrixOrder.toLowerCase().includes("discussion"))
//      ; // do nothing
//  }

  xmScale.domain((currentMatrixOrder == null) ? defaultMatrixOrdering : kpisAvailable[currentMatrixOrder]);


/* how to call this dynamically - closest below... */
//  var gradient = svgDM.append("defs")
//                    .append("linearGradient")
//                      .attr("id", "gradient")
//                      .attr("x1", "0%")
//                      .attr("y1", "0%")
//                      .attr("x2", "100%")
//                      .attr("y2", "100%")
//                      .attr("spreadMethod", "pad");
//
//  gradient.selectAll("stop")
//          .data(codedVars)
//          .enter().append("stop")
//          .attr("offset", function(d, i) { return i / (codedVars.length - 1); })
//          .attr("stop-color", function(d, i) { return colourScale[i]; })
//          .attr("stop-opacity", 1);
//
//
  var gradients = new Map();
  for (var codeX of Object.keys(codedVars)) {
    for (var codeY of Object.keys(codedVars)) {
      if (codeX == codeY)
        continue;

      var gradientYX = svgDM.append("defs")
                          .append("linearGradient")
                            .attr("id", "gradient-" + codedVars[codeY] + "-" + codedVars[codeX])
                            .attr("x1", "0%")
                            .attr("y1", "0%")
                            .attr("x2", "100%")
                            .attr("y2", "100%")
                            .attr("spreadMethod", "pad");

      gradientYX.selectAll("stop")
                .data( [codedVars[codeX], codedVars[codeY]] )
                .enter().append("stop")
                .attr("offset", function(d, i) { return i; })
                .attr("stop-color", function(d, i) { return ((i == 0) ? colourScale[codeY] : colourScale[codeX]); })
                .attr("stop-opacity", 1);

      gradients.set(codedVars[codeY] + "-" + codedVars[codeX], gradientYX);
    }
  }

  var row = svgDM.selectAll(".row")
                  .data(matrix)
                  .enter().append("g")
                    .attr("class", "row")
                    .attr("transform", function(d, i) { return "translate(" + matrixMargin.left + ", " +
                                                                            (xmScale(i) + matrixMargin.top + matrixMargin.bottom) + ")"; })
                    .each(row);

  row.append("line")
      .attr("x2", +svgDM.attr("width") - matrixMargin.left - matrixMargin.right)
      .style("stroke", "white");

  row.append("text")
      //.attr("x", -6)
      .attr("y", xmScale.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .style("font-size", "1.1em")
      .text(function(d, i) { return graph[i].CompanyName; })
      .style("fill", function(d, i) { return colourScale[codedVars.indexOf(graph[i][encodingVar])]; })
      .append("title")
          .text(function(d, i) { return graph[i].CompanyName; });


  var column = svgDM.selectAll(".column")
                    .data(matrix)
                  .enter().append("g")
                    .attr("class", "column")
                    .attr("transform", function(d, i) { return "translate(" + (xmScale(i) + matrixMargin.left) + ")rotate(-90)"; });

  column.append("line")
        .attr("x1", -(+svgDM.attr("height") - matrixMargin.top - matrixMargin.bottom - xmScale.bandwidth() * 2))
        .style("stroke", "white")
        .attr("transform", function(d, i) { return "translate(" + -(matrixMargin.top + matrixMargin.bottom) + ", 0)"; });

  column.append("text")
        .attr("x", -matrixMargin.left)//60)
        .attr("y", xmScale.bandwidth() / 2)
        .attr("dy", ".32em")
        .attr("text-anchor", "start")
        .attr("transform", function(d) { return "translate(0," + (matrixMargin.top - matrixMargin.right) + ") rotate(35)"; })
          .style("font-size", "1.1em")
        .text(function(d, i) { return graph[i].CompanyName;/*truncate(d[i].idY, 7, "...");*/ })
        .style("fill", function(d, i) { return colourScale[codedVars.indexOf(graph[i][encodingVar])]; })
        .append("title")
          .text(function(d, i) { return graph[i].CompanyName; });

  function row(row) {
    var cell = d3.select(this).selectAll(".cell")
                    .data(row.filter(function(d) { return d.z; }))
                  .enter().append("rect")
                    .attr("class", function(d, i) { var orderOnLoad = (currentMatrixOrder ? currentMatrixOrder : defaultMatrixOrder);
//                                                    if (orderOnLoad) {
//                                                      var learnerX = learnerStore.get(d.idX),
//                                                          learnerY = learnerStore.get(d.idY);
//
//                                                      if ((orderOnLoad == "interactionCount") || orderOnLoad.toLowerCase().includes("discussion"))
//                                                        return "cell";
//                                                      if ((d.x < d.y) && (!learnerY.participationAssessmentCriteria || !learnerY.participationAssessmentCriteria.has(orderOnLoad)))
//                                                        return "cell fails_criterion";
//                                                      if (!learnerX.participationAssessmentCriteria || !learnerX.participationAssessmentCriteria.has(orderOnLoad))
//                                                        return "cell fails_criterion";
//                                                    }

                                                    // if get this far...
                                                    return "cell";
                    })  // end - class
                    .attr("id", function(d) { return (graph[d.x].identifier + "__" + graph[d.y].identifier); })
                    .attr("x", function(d) { return xmScale(d.x); })
                    .attr("width", xmScale.bandwidth())
                    .attr("height", xmScale.bandwidth())
                    .style("fill-opacity", function(d) { return zmScale(d.z); })
                    .style("fill", function(d, i) {
                       return (graph[d.x][encodingVar] == graph[d.y][encodingVar]) ?
                                    colourScale[codedVars.indexOf(graph[d.y][encodingVar])] :
                                    "url(#gradient-" + graph[d.y][encodingVar] + "-" + graph[d.x][encodingVar] + ")";
                    })
                    .on("mouseover", mouseOver)
                    .on("mouseout", mouseOut)

                    .on("click", function(d) {

                      var matrixIds = matchNetworkNodeToMatrixCell(null, this.id, networkToMatrixMatch.matrix_to_network);
                      var xId = graph[d.x].OrganisationType + "__" + graph[d.x].identifier,
                          yId = graph[d.y].OrganisationType + "__" + graph[d.y].identifier;

                      // select from graph
                      var deselected = !graph[d.y].selected || !graph[d.x].selected;  // at least one ...
//console.log("click - cell", d, matrixIds, d3.select(this), graph[d.y], graph[d.x], xId, d3.select("#" + xId), yId, d3.select("#" + yId), deselected, !graph[d.y].selected, !graph[d.x].selected);

                      if (shiftKeyDown = event.shiftKey || event.metaKey) {
                        d3.select("#" + yId).classed("active", function() {
                          if (deselected) {
                            if (selectedOrganisations.indexOf(graph[d.y]) == -1)
                              selectedOrganisations.push(graph[d.y]);

                          } else {
                            if (selectedOrganisations.indexOf(graph[d.y]) != -1)
                              selectedOrganisations.splice(selectedOrganisations.indexOf(graph[d.y]), 1);
                          }

                          return (graph[d.y].selected = deselected);
                        }); // end select nodeY

                        if (matrixIds.length > 1)
                          d3.select("#" + xId).classed("active", function() {
                            if (deselected) {
                              if (selectedOrganisations.indexOf(graph[d.x]) == -1)
                                selectedOrganisations.push(graph[d.x]);

                            } else {
                              if (selectedOrganisations.indexOf(graph[d.x]) != -1)
                                selectedOrganisations.splice(selectedOrganisations.indexOf(graph[d.x]), 1);
                            }

                            return (graph[d.x].selected = deselected);
                          }); // end select nodeX

                          d3.select(this).classed("cross node-matrix", deselected);

                      } else {
                        node.classed("active", function(p) { return (xId.endsWith(p.identifier) || yId.endsWith(p.identifier)); });

                        d3.selectAll(".cell")
                          .classed("cross node-matrix", false);
                        d3.select(this)
                          .classed("cross node-matrix", true);

                        selectedOrganisations = (matrixIds.length == 1) ? [ graph[d.y] ] : [ graph[d.y], graph[d.x] ];
                      }

                      displayOrganisationDetail(selectedOrganisations);

                    })   // end onClick

                    .on("dblclick", function(d) {
/*
  var origin = {lat: 52.485, lng: -1.889},
  destination = {lat: 52.49163, lng: -1.8596};
                    getDistanceOnMap(origin, destination);
*/
                      resetGraph(); // may need to clear graph

                      d3.selectAll(".cell")
                        .classed("active node-matrix-diagonal node-matrix", false);

                      var matrixIds = matchNetworkNodeToMatrixCell(null, this.id, networkToMatrixMatch.matrix_to_network);
//console.log("matchNetworkNodeToMatrixCell", matrix)
                      if ((matrixIds.length == 1) || (matrixIds[0] == matrixIds[1]))
                        d3.select(this).classed("node-matrix-diagonal", true);
                      else
                        d3.select(this).classed("cross node-matrix", true);

console.log("dblclick", d, matrixIds, graph[nodeIndexLookUp.get(matrixIds[0])])

                      d3.selectAll(".node")
                        .select(function(event) {

                          var nodeId = matchNetworkNodeToMatrixCell(this.id, null, networkToMatrixMatch.network_to_matrix);

                          if (matrixIds.indexOf(nodeId[0]) != -1) {
                            focusOrganisation = graph[d.y];

                            if ((matrixIds.length == 1) || (matrixIds[0] == matrixIds[1]))
                              d3.select(this).classed("node-matrix-diagonal", true);
                            else
                              d3.select(this).classed("node-matrix", true);

                            return this;
                          } else {
                            d3.select(this).classed("node-matrix-diagonal", false);
                            d3.select(this).classed("node-matrix", false);
                          }

                          highlightSelection(nodeId[0]);
                        })
                      // end select

//console.log("kpis - matrix?", matrixIds[0], matrixIds[1], d, nodeIndexLookUp.get(matrixIds[0]), graph[d.y]);
                      if (matrixIds.length == 1) {  // on diagonal...
                        updateKpiOptionsUi(graph[d.y]);
                        //highlightSelection(matrixIds[0]);
                      }

                      selectedOrganisations = (matrixIds.length == 1) ? [ graph[d.y] ] : [ graph[d.y], graph[d.x] ];
                      displayOrganisationDetail(selectedOrganisations);
                    }) // end on dblclick

                    .append("title")  // needs to come after mouseHover fns or blocks them
                      .text(function(d, i) { return ((d.x == d.y) ?
                                                       graph[d.y].CompanyName :
                                                       graph[d.y].CompanyName + " - " + graph[d.x].CompanyName);
                                            });
  } // end draw


  if (!currentMatrixOrder) {
    currentMatrixOrder = defaultMatrixOrder;

    d3.select("#kpiOptions")
        .append("select")
        .attr("id", "kpiOptionsSelector")

      .selectAll("optgroup")
        .data([ kpis.kpiScope.all ])  // needs a value to run...
          .enter()
        .append("optgroup")
          .attr("label", kpis.kpiScope.all)


      .selectAll("option")
        .data(Object.keys(kpis.standardKpis))
          .enter()
        .append("option")
          .attr("id", function(d) { return d; })
          .attr("value", function(d) { return d; })
          .text(function(d) { return standardKpiLabels[d]; })
  }

  var timeout = setTimeout(function() {
    d3.select("#kpiOptionsSelector")
//      .property("selected", function() {  return currentMatrixOrder;
//                                        }) // @todo - but doesn't shift select focus unless using index...
      .property("selectedIndex", function() { return (currentMatrixOrder ? Object.keys(standardKpiLabels).indexOf(currentMatrixOrder) :
                                                                              Object.keys(standardKpiLabels).indexOf(defaultMatrixOrder));
                                            })
        .node()
        .focus();
  }, 1500);


  d3.select("#kpiOptionsSelector") // need to set id for selector and call this, not outer container...
    .on("change", function() {
      clearTimeout(timeout);
      sortBy(this, svgDM);
    })

    // need to update on data subset change
    .selectAll("option")
      .attr("title", "Reorder matrix ...")//function(d) { return "Reorder matrix by " + standardKpiLabels[d]; })
//      .property("disabled", function(d) { });
}

//function showHideKpiSelectionPane(show) {
//  var showPanel = show;
//
//  if (show) {
//    showPanel = false; // reset...
//
//    d3.selectAll(".node-matrix-diagonal")
//        .filter(".node")
//      .select(function() {
//        showPanel = true;
//      });
//    }
//
//  document.getElementById("kpiOptions").style.visibility = ((showPanel == false) ? "hidden" : "visible");
//  document.getElementById("kpiOptions").style.display = ((showPanel == false) ? "none" : "inline-block");
//}

function updateKpiOptionsUi(organisation) {

  var data = focusKpiCategories[organisation.OrganisationType];
	//showHideKpiSelectionPane(!organisation.identifier.startsWith("subNetwork_") && (data.length > 0));

//console.log("kpis - loaded...", organisation.OrganisationType, Object.values(focusKpis), focusKpiCategories, organisationType, data, (data.length > 0), !organisation.identifier.startsWith("subNetwork_"))

  var currentSelection;
  if (organisation && (organisation.identifier.startsWith("subNetwork_") || (data.length == 0))) {
    delete kpiOptionGroups["selectedNode"]; // do nothing
  } else {
    Object.keys(kpis.kpiGroups).forEach(function(key) {
      if (kpis[kpis.kpiGroups[key]]) {
        if (key == "selectedNode") {
          currentSelection = [];
          Object.values(kpis.focusKpiCategories[organisation.OrganisationType]).forEach(function(kpi) {
            currentSelection[kpi] = focusKpis[kpi];
            console.log("kpis - focus", organisation.OrganisationType, kpi, focusKpis[kpi], Object.entries(currentSelection));
          });
          kpiOptionGroups[key] = currentSelection;
        }
        // @todo - standard already set - need to include (multiple) selection
        console.log("kpis - groups1", key, kpis.kpiGroups[key], kpis.kpiScope[key], Object.keys(kpis[kpis.kpiGroups[key]]));//, Object.keys(kpis[key]));
      }
    });
  }

//console.log("kpis - values", Object.values(kpiOptionGroups), Object.keys(kpiOptionGroups), kpisAvailable)

    // @todo - exit, remove and merge doesn't work properly because of the optGroup :@
    d3.selectAll("#kpiOptionsSelector")
      .remove();

    d3.select("#kpiOptions")
        .append("select")
        .attr("id", "kpiOptionsSelector")

      .selectAll("optgroup")
        .data(Object.keys(kpiOptionGroups))
      .enter()
      .append("optgroup")
        .attr("label", function (d) { //console.log("kpis - keys?", d, kpis.kpiScope[d], organisation.OrganisationType);
                            return "-- " +  kpis.kpiScope[d] +
                                  ((d == "selectedNode") ? "-" + organisation.OrganisationType : "") +
                                  " --"; })

      .selectAll("option")
        .data(function (d, i) { console.log("kpis?", d, kpiOptionGroups[d], i, Object.entries(kpiOptionGroups[d])); return Object.entries(kpiOptionGroups[d]); })//console.log("kpis - in iterate", d.value, Object.values(kpiOptionGroups)); return d.value; })//Object.values(kpiOptionGroups); })
      .enter()
      .append("option")
        .attr("value", function (d) { return d[0]; })
        .text(function (d) { /*console.log("kpis - iterate", d, d[0], d[1]);*/ return d[1]; });



  var timeout = setTimeout(function() {
    d3.select("#kpiOptionsSelector")
//      .property("selected", function() {  return currentMatrixOrder;
//                                        }) // @todo - but doesn't shift select focus unless using index...
      .property("selectedIndex", selectedNodeIndex)
        .node()
        .focus();
  }, 1500);


  d3.select("#kpiOptionsSelector") // need to set id for selector and call this, not outer container...
    .on("change", function() {
      clearTimeout(timeout);
      sortBy(this, svgDM);
    })

    // need to update on data subset change
    .selectAll("option")
      .attr("title", "Reorder matrix ...")//function(d) { return "Reorder matrix by " + standardKpiLabels[d]; })
//      .property("disabled", function(d) { });


  // reset to default - network/contact count - @todo - ?best fit?
  d3.select("#kpiOptionsSelector")
    .select(function() {
      sortBy(this, svgDM);
      highlightSelection([organisation.identifier]);
    });
}

function initGraph(addToGraph, uri) {
  if (radius)
    nodeRadius = radius;

  if (!addToGraph) {
    graph = [];
    links = [];
    root = undefined;
    nodeIndexLookUp.clear();

    d3.selectAll(".node")  //("svg > *")  // extreme - everything, not just this pane
      .remove();
    d3.selectAll(".link")
      .remove();
//    d3.selectAll(".row")  // issues when cleared here ...
//      .remove();
//    d3.selectAll(".column")
//      .remove();

    matrix = [];


    // need to reset vars so graph redraws properly, otherwise retains pointers and randomly gets messed up
    // - reset graph, NOT not simulation - that just kills everything... :@
    node = svgDN.selectAll(".node"),
    link = svgDN.selectAll(".link");


    baseUri = (uri ? uri : "");
    if (baseUri.endsWith("/"))
      baseUri = baseUri.substring(0, baseUri.lastIndexOf("/"));
  }


  fadeNonRoi = false;
}

function drawNetwork(weights, addToGraph) {

  // @todo - sort out brush - see also network diag - expertise analysis
  svgDN.on("keydown.brush", keyflip)
        .on("keyup.brush", keyflip)
        .each(function() { /*this.focus();*/ }) // @todo - throws error in FF - TypeError: this.focus is not a function


  linkWidthWeightingScale = d3.scaleLinear() //@todo - need to set thresholds
    .range([0.15, 3])
    .domain([1, d3.max(weights)]);
  linkDistanceWeightingScale = d3.scaleLinear() //@todo - need to set thresholds
    .range([30, 90])
    .domain([1, maxLinkWeight]);


  var subNetworkHubNode;
  subNetworkHubs.forEach(function(subNetwork, subNetworkHub) {
    //console.log("node.OrganisationType", subNetwork, subNetworkHub)

    subNetworkHubNode = { "identifier" : "subNetwork_".concat(subNetworkHub),
                          "CompanyName" : subNetworkHub.concat("s"),
                          "OrganisationType" : subNetworkHub,
                          "NetworkConnections" : 0,
                        };
    addNodeToGraph(subNetworkHubNode, null);
    links.push({  "source": root.identifier,
                  "target": subNetworkHubNode.identifier,
                });

    subNetwork.forEach(function(nodeIdentifier) {
      subNetworkHubNode.NetworkConnections++;

      links.push({  "source": subNetworkHubNode.identifier,
                    "target": nodeIdentifier,
                  });
    });
  }); // end subNetworkHubs

console.log("node?", graph, links)

  drawLinks();
  drawNodes();

  simulation
      .nodes(graph)
      .on("tick", ticked)
      //.on("start", console.log("wtf - drawNetwork onStart???"))
      .on("end", function(d) {
                      graphUpdateStart = (new Date()).getTime();
                      nodeCount = graph.length;
//                      if (runUpdate)  // @todo - delete if not necessary - leave for now as anchor
//                        runGraphUpdate(runUpdate, triggerAction, dataFiles);
      });

  simulation.force("link")
            .links(links);

  function ticked() {

    link
        .attr("x1", function(d) { /*console.log("ticked links?", d, d.source, d.target);*/ return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

//      node
//          .attr("cx", function(d) { return d.x; })
//          .attr("cy", function(d) { return d.y; });
//      node.attr("cx", function(d) { return d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x)); })
//          .attr("cy", function(d) { return d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y)); });

    node.attr("transform", function(d) { return "translate(" +
                                                      (d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x))) + "," +
                                                      (d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y))) +
                                                      ")"; });

    // for text either translation mode works, not so for node when drawing image
    if (drawLabels)
      text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
//          .attr("x", function(d) { return d.x; })
//          .attr("y", function(d) { return d.y; });
  }

  location.href = "#" + networkPane;
}

function drawNodes() {

  var nodeRadiusScale = d3.scaleLinear()//og()
                          .range([1, 10])//2
                          .domain(d3.extent(graph.reduce(function(a, b) { // will fail if 0 - log(0) == NaN
                                                                          return a.concat(((b.NetworkConnections > 0) ? b.NetworkConnections : 0.000001));
                                                                        }, [])))
                          .clamp(true);

  node = node.data(graph, function(d) {  return d.identifier; })
  node.exit().remove();

  node = node.enter()
                .append(drawIcons ? "g" : "circle")
              .attr("class", function(d) { var classLabel = "node " + d.OrganisationType;

                                            if (d.identifier == root.identifier)
                                              classLabel += " root";
                                            else if (d.identifier.startsWith("subNetwork_"))
                                              classLabel += " sub-network";
                                            else if (!d.RegistrationDate)
                                              classLabel += " unregistered";

                                            return classLabel;
                                          })
              .attr("id", function(d) {
                return (d.OrganisationType + "__" + d.identifier);
              })
              .attr("r", function(d) { return (nodeRadiusScale(d.NetworkConnections) * nodeRadius); })
              .style("fill", function(d, i) { return colourScale[codedVars.indexOf(d[encodingVar])]; })
              .style("opacity", function(d) { if (!d.identifier.startsWith("subNetwork_") && !d.RegistrationDate)
                                                return 0.35;
                                            })
              .call(d3.drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended))

              // @todo - sort out
              //.call(d3.behavior.zoom().x(xScale).y(yScale).scaleExtent([1, 8]).on("zoom", zoom))

              .on("click", function(d) {  // mousedown only works for right mouse button... :@


                var nodeId = matchNetworkNodeToMatrixCell(this.id, null, networkToMatrixMatch.network_to_matrix);
                var matrixId = nodeId + "__" + nodeId;  // xId__yId
//console.log("click - from cell", d, matrixId, d3.select("#" + matrixId))//, graph[d.y], graph[d.x], xId, d3.select("#" + xId), yId, d3.select("#" + yId))//, deselected, !graph[d.y].selected, !graph[d.x].selected);
//console.log("click - node", d3.select(this), matrixId, d)

                if (shiftKeyDown = event.shiftKey || event.metaKey) {
                  d3.select("#" + matrixId).classed("cross node-matrix", !d.selected);

                  d3.select(this).classed("active", function() {
                    if (d.selected)
                      selectedOrganisations.splice(selectedOrganisations.indexOf(d), 1);
                    else
                      selectedOrganisations.push(d);

                    return (d.selected = !d.selected);
                  });

                } else {
                  node.classed("active", function(p) { return (p.selected = (d === p)); });

                  d3.selectAll(".cell")
                    .classed("cross node-matrix", false);
                  d3.select("#" + matrixId)
                    .classed("cross node-matrix", d.selected);

                  selectedOrganisations = [d];
                }

                displayOrganisationDetail(selectedOrganisations);

              })   // end onClick

              .on("dblclick", function(d, i) {
                d3.selectAll(".node")
                  .classed("active node-matrix-diagonal node-matrix", false);

                fadeNonRoi = event.metaKey;

                if (shiftKeyDown = event.shiftKey) {
                  resetGraph();
                  //showHideKpiSelectionPane();
                  return;
                }

                var nodeId = matchNetworkNodeToMatrixCell(this.id, null, networkToMatrixMatch.network_to_matrix);
                d3.select(this)
                    .classed("node-matrix-diagonal", true)
//                    .style("opacity", function(d) { if (!d.identifier.startsWith("subNetwork_") && !d.RegistrationDate)
//                                                      return 0.35;
//                                                  });

                d3.selectAll(".cell")
                  .select(function(event) {

                    var matrixIds = matchNetworkNodeToMatrixCell(null, this.id, networkToMatrixMatch.matrix_to_network);
                    if (matrixIds.indexOf(nodeId[0]) != -1) {
                      if ((matrixIds.length == 1) || (matrixIds[0] == matrixIds[1]))
                        d3.select(this).classed("node-matrix-diagonal", true);
                      else
                        d3.select(this).classed("node-matrix", true);

// del on complete  //console.log("matrix switch?", nodeId, matrixIds, this);
                      return this;
                    } else {
                      d3.select(this).classed("node-matrix-diagonal", false);
                      d3.select(this).classed("node-matrix", false);
                    }

                    highlightSelection(nodeId);
                  });

                  updateKpiOptionsUi(d);
                  focusOrganisation = d;
                  displayOrganisationDetail(selectedOrganisations = [d]);
              }); // end dblclick

  node.append("image")
      //.attr("xlink:href", function(d) { return getIcon(d.OrganisationType); })
      .attr("x", function(d) { return -((nodeRadiusScale(d.NetworkConnections) * nodeRadius)); })
      .attr("y", function(d) { return -((nodeRadiusScale(d.NetworkConnections) * nodeRadius)); })
      .attr("width", function(d) { return (nodeRadiusScale(d.NetworkConnections) * nodeRadius * 2); })//16
      .attr("height", function(d) { return (nodeRadiusScale(d.NetworkConnections) * nodeRadius * 2); })
      //.style("border", "5px solid red");  //@todo - not working

//// commenting out because drawing at T-L even set on iconDraw
//// this works only when drawing icons - calling "g" as opposed to "circle" - next works for either :@
////    node.append("text")
////        .attr("dx", 12)
////        .attr("dy", ".35em")
////        .text(function(d) { return ((d.Title && (d.identifier != root.identifier)) ? d.Title.substring(0,20) + ((d.Title.length > 20) ? " ..." : "") : ""); })
  text = svgDN.selectAll(".text")
            .data(graph)
            .enter()
              .append("text")
            .attr("text-anchor", "middle")
            //.attr("dx", function(d) { return -(d.CompanyName.length)}) // offset to node
            .attr("dy", "-.15em") // move just off center so can grab smaller nodes
            .text(function(d) { return (((d == root) || d.identifier.startsWith("subNetwork_")) ? splitCamelOrPascalCase(d.CompanyName) : null); })
            .style("font-size", function(d) {
              if ((d == root) || d.identifier.startsWith("subNetwork_"))
                return "12px";
            })
            .style("fill", function(d) {
              //if (d.type == objectTypes.skill) {
                return "blue";
             // }
            })
            //.style("stroke-width", 0.1); ? can't see impact...

  node//.append("text")
//	    .attr("dx", function(d) { console.log("labels?", d.CompanyName, this); return 200; })
//              .style("fill", function(d, i) { return colourScale[codedVars.indexOf(d[encodingVar])]; })
//              .style("stroke", function(d) { return (((d == root) || d.identifier.startsWith("subNetwork_")) ? "lightgray" : "none"); })
//	    .text(function(d) { return d.identifier; })

      .append("title")
      .text(function(d) { return createNodeLabel(d.CompanyName +
                                                  //"\n\t" + d.CompanyUri +
                                                  ((d.RegistrationDate != undefined) ? "\n\tRegistered: " + formatDateDby(d.RegistrationDate) : "")
                                                  );
                        });

} // end drawNodes

function drawLinks() {

//    svgDN.append("svg:defs").selectAll("marker")
//          .data(["end"])
//          .enter()
//        .append("svg:marker")
//          .attr({"id": "arrowhead",
//                 "viewBox":"0 -5 10 10",
//                 "refX": 22,
//                 "refY": 0,
//                 "orient":"auto",
//                 "markerWidth": 20,
//                 "markerHeight": 20,
//                 "markerUnits": "strokeWidth",
//                 "xoverflow":"visible"})
//        .append("svg:path")
//          .attr("d", "M0,-5L10,0L0,5")
//          .attr("fill", "#ccc");

//svgDN.append("defs").selectAll("marker")
//    .data(["end"])
//    .enter()
//    .append("svg:marker")
//    .attr({
//        "id": "arrowhead",
//        "viewBox": "0 -5 10 10",
//        "refX": 18,
//        "orient": "auto"
//    })
//    .append("svg:path")
//    .attr("d", "M0,-5L10,0L0,5");

var defs = svgDN.append('svg:defs');
    defs.append('svg:marker')
        .attr('id', 'end-arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', "32")
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

    // define arrow markers for leading arrow
    defs.append('svg:marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 7)
        .attr('markerWidth', 3.5)
        .attr('markerHeight', 3.5)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,-5L10,0L0,5');

  link = link.data(links, function(d) { return d.target; });
  link.exit().remove();

//@todo - clean on complete
  var sourceNode;
  link = link.enter()
                .append("line")
              .attr("class", function(d, i) {
                var classLabel = "link";
                if (d.source != root.identifier)
                  classLabel += " linkToRoot";
                return classLabel;
              })
              .attr("id", function(d) { return (d.source + "__" + d.target); })
              //.attr('d', 'M0,0L0,0')
              //.style("marker-end",  "url(#arrowhead)")
              .style("stroke", function(d) {  sourceNode = graph[nodeIndexLookUp.get(d.source)];
                                              //console.log("link", encodingVar, nodeIndexLookUp.get(d.source), sourceNode, sourceNode[encodingVar], colourScale[codedVars.indexOf(sourceNode[encodingVar])],
                                              //              d, d.source, d.target, ((d.weight) ? linkWidthWeightingScale(d.weight) : "no weight " + linkWidthWeightingScale(0)), d.source + "__" + d.target);
                                              return colourScale[codedVars.indexOf(sourceNode[encodingVar])]; })
              .style("stroke-width", function(d) { return ((d.weight) ? linkWidthWeightingScale(d.weight) : 0.5); });

} // end drawLinks

function linkDistance(d) {
  return linkDistanceWeightingScale(d.weight ? (maxLinkWeight / (d.weight + 1)) : maxLinkWeight);
}

function addNodeToGraph(node, parent, metadata) {
  if (nodeIndexLookUp.has(node.identifier)) {
    console.log("Node ID '" + node.identifier + "' already stored in graph: ", node);
    return;
  }

  nodeIndexLookUp.set(node.identifier, graph.push(node) - 1);

  if (metadata)
    node.metadata = metadata;

  if ((node != root) && (parent != null))
    links.push({  "source": parent.identifier,  // inLinks - using reverse direction
                  "target": node.identifier
                });

  return graph.length - 1;
}


function highlightSelection(nodeId) {
  var linkIds,
      linkedNodes = new Set();

  d3.selectAll(".link")
    .select(function(event) {
      linkIds = this.id.split("__");

      if (linkIds.length == 2) { // shd be, but play safe ...
        if (linkIds[1] == nodeId) { // child
          d3.select(this).classed("from-contributor", true);
          linkedNodes.add(linkIds[0]);

        } else if (linkIds[0] == nodeId) { // parent
          d3.select(this).classed("from-parent", true);
          linkedNodes.add(linkIds[1]);

        } else
          d3.select(this).classed("from-contributor from-parent", false);

      } else
         d3.select(this).classed("from-contributor from-parent", false);

      //highlightLink(this);
      return this;
    })
    .style("stroke", function(d) {
      sourceNode = graph[nodeIndexLookUp.get(d.source.identifier)];
      return colourScale[codedVars.indexOf(sourceNode[encodingVar])]
    })
    .style("opacity", function(d) {
      var linkHighlight = d3.select(this).attr("class");
      return ((linkHighlight.includes("from-contributor") || linkHighlight.includes("from-parent")) ? 1 : 0.35);
    });

    d3.selectAll(".node")
      .style("opacity", function(d) {
        if (fadeNonRoi) {
          if (linkedNodes.has(d.identifier) || (d.identifier == nodeId))
            ;
          else
            return 0.2;
        } else if (!d.identifier.startsWith("subNetwork_") && !d.RegistrationDate)
          return 0.35;
      });
}

function resetGraph(maintainOptionsUI) {

  d3.selectAll(".node")
    .classed("active node-matrix-diagonal node-matrix", false)
    .style("fill", function(d, i) { return colourScale[codedVars.indexOf(d[encodingVar])]; })
    .style("opacity", function(d) { if (!d.identifier.startsWith("subNetwork_") && !d.RegistrationDate)
                                      return 0.35;
                                  });

  d3.selectAll(".link")
    .classed("from-contributor from-parent", false)
    .style("stroke", function(d) {  sourceNode = graph[nodeIndexLookUp.get(d.source.identifier)];
                                    return colourScale[codedVars.indexOf(sourceNode[encodingVar])];
    })
    .style("opacity", function(d) {
        return (!fadeNonRoi ? 1 :
                ((linkedNodes.has(d.identifier) || (d.identifier == nodeId)) ? 1 : 0.2));
    });


  fadeNonRoi = false;
  document.getElementById("infoBox").text = "";
  document.getElementById("infoPanel").style.visibility = "hidden";

  if (!maintainOptionsUI)
    updateKpiOptionsUi(root);

  console.log("resetGraph")
}

function mouseOver(p) {
  d3.selectAll(".row text")
    .classed("active", function(d, i) { return i == p.y; });
  d3.selectAll(".column text")
    .classed("active", function(d, i) { return i == p.x; });
  d3.selectAll(".cell")
    .classed("active", function(d, i) { return ((d.x == p.x) && (d.y == p.y)) });
}

function mouseOut() {
  d3.selectAll("text").classed("active", false);
  d3.selectAll(".cell").classed("active", false);
}

function sortBy(optionSelected, svgPane) {
  var lastSelectedIndex = (selectedNodeIndex ? selectedNodeIndex : 0),
      lastSelectedValue = currentMatrixOrder;

  currentMatrixOrder = optionSelected.value;
  selectedNodeIndex = optionSelected.selectedIndex;

  if (currentMatrixOrder == "selected_node") {
    kpisAvailable[currentMatrixOrder] = undefined; // reset...
    d3.selectAll(".node-matrix-diagonal")
        .filter(".node")
      .select(function(selectedNode) {

//console.log("kpis - selection", this.id, this, selectedNode, selectedNode.identifier);
        if (selectedNode.InputFeedstock)
          rankPreferredFeedstockSuppliers(selectedNode, graph);//, 3); - @todo - throw relax query
        else
          console.log("kpis - selection", selectedNode.CompanyName  + " is not a feedstock purchaser!")
      });
  } else if (currentMatrixOrder == "feedstock_supply") {
    d3.selectAll(".node-matrix-diagonal")
        .filter(".node")
      .select(function(selectedNode) {
        rankFeedstockSuppliersByFeedstockSupply(currentMatrixOrder, selectedNode, graph);
      });
  } else if (currentMatrixOrder == "geo_distance") {
    d3.selectAll(".node-matrix-diagonal")
        .filter(".node")
      .select(function(selectedNode) {
        rankByShortestDrivingDistance(currentMatrixOrder, selectedNode, nodeIndexLookUp, graph);
      });
  }
  if (!kpisAvailable[currentMatrixOrder]) {
    alert("Option '" + document.getElementById(optionSelected.value).text + "' not yet implemented for this organisation type! ");

    optionSelected.selectedIndex = lastSelectedIndex;
    optionSelected.value = lastSelectedValue;

    selectedNodeIndex = optionSelected.selectedIndex;
    currentMatrixOrder = optionSelected.value;

    return;
  }


//console.log("kpis - sortBy", kpisAvailable, currentMatrixOrder, optionSelected, selectedNodeIndex, kpisAvailable[currentMatrixOrder])

  xmScale.domain(kpisAvailable[currentMatrixOrder]);
  var transition = svgPane.transition().duration(2500);

  transition.selectAll(".row")
              .delay(function(d, i) { return xmScale(i) * 4; })
              .attr("transform", function(d, i) { return "translate(" + matrixMargin.left + "," +
                                                                        (xmScale(i) + matrixMargin.top + matrixMargin.bottom) + ")"; })
            .selectAll(".cell")
              .delay(function(d) { return xmScale(d.x) * 4; })
              .attr("x", function(d) { return xmScale(d.x); });

  transition.selectAll(".column")
            .delay(function(d, i) { return xmScale(i) * 4; })
            .attr("transform", function(d, i) { return "translate(" + (xmScale(i) + matrixMargin.left) + ")rotate(-90)"; });

//  d3.selectAll(".cell")
//    .classed("fails_criterion", function(d, i) {  if (currentMatrixOrder) {
//                                                    var learnerX = learnerStore.get(d.idX),
//                                                        learnerY = learnerStore.get(d.idY);
//
//                                                    if ((currentMatrixOrder == "interactionCount") || currentMatrixOrder.toLowerCase().includes("discussion"))
//                                                      return false;
//                                                    if ((d.x < d.y) && (!learnerY.participationAssessmentCriteria || !learnerY.participationAssessmentCriteria.has(currentMatrixOrder)))
//                                                      return true;
//                                                    if (!learnerX.participationAssessmentCriteria || !learnerX.participationAssessmentCriteria.has(currentMatrixOrder))
//                                                      return true;
//                                                  }
//
//                                                  // if get this far...
//                                                  return false;
//                                                });

  if (hideNonMatches) {
    console.log("hideNonMatches", fadeNonMatches)

  } else if (fadeNonMatches) {
    console.log("fadeNonMatches", fadeNonMatches);

    d3.selectAll(".cell")
      .classed(failsMatch, function(d) { // @todo - needed two-step - returning function wdn't work - no clue why - but then started after next two...
        return graph[d.y].failsMatch.get(standardKpiLabels[currentMatrixOrder]);
      });

    d3.selectAll(".row text")
      .classed("failsMatch", function(d, i) { return graph[d[i].y].failsMatch.get(standardKpiLabels[currentMatrixOrder]); });
    d3.selectAll(".column text")
      .classed("failsMatch", function(d, i) { return graph[d[i].y].failsMatch.get(standardKpiLabels[currentMatrixOrder]); });

    var dummyNodesPassMatch = new Set();
    d3.selectAll(".link")
      .classed("failsMatch", function(d, i) {
                    var sourceFailsMatch = (d.source.failsMatch ? d.source.failsMatch.get(standardKpiLabels[currentMatrixOrder]) : false),
                        targetFailsMatch = (d.target.failsMatch ? d.target.failsMatch.get(standardKpiLabels[currentMatrixOrder]) : false);
                    if (d.source.identifier.startsWith("subNetwork_") && !targetFailsMatch)
                      dummyNodesPassMatch.add(d.source.identifier);
                    else if (d.target.identifier.startsWith("subNetwork_") && !sourceFailsMatch)
                      dummyNodesPassMatch.add(d.target.identifier);

                    return (targetFailsMatch || sourceFailsMatch);
      });
    d3.selectAll(".node")
      .classed("failsMatch", function(d, i) {
        if (d.identifier.startsWith("subNetwork_"))
          return !dummyNodesPassMatch.has(d.identifier);  // fail parent if all children do
        return (d.failsMatch ? d.failsMatch.get(standardKpiLabels[currentMatrixOrder]) : false);
    });
  }
}

function createNodeLabel(label) {
  // @todo - implement
  return label;
}


function getShortestMeanDeliveryCycle(feedstockDetail) {  // not easily translated - as uses indexes

  var currentDeliveryCycle;
  var cycles = feedstockDetail.reduce(function(result, feedstock) {
                                      if ((currentDeliveryCycle = deliveryCycle.indexOf(feedstock.DeliveryCycle)) == -1)
                                        return result;
                                      return result.concat(currentDeliveryCycle);
                                    }, []);
  return d3.mean(cycles);
}

function getShortestDeliveryCycle(feedstockDetail) {

  var shortestDeliveryCycle = Number.MAX_SAFE_INTEGER,
      currentDeliveryCycle,
      feedstockType;
  for (var i in feedstockDetail) {
    if ((currentDeliversCycle = deliveryCycles.indexOf(feedstockDetail[i].DeliveryCycle)) == -1)
      continue;

    //console.log("iterator", feedstockDetail[i], feedstockDetail[i].DeliveryCycle, currentDeliveryCycle)
    if (currentDeliveryCycle < shortestDeliveryCycle) {
      shortestDeliveryCycle = currentDeliveryCycle;
      feedstockType = feedstockDetail[i].WasteType;
    }
  }

  return [feedstockType, shortestDeliveryCycle];
}

function getLargestDeliveryQuantity(feedstockDetail) {
  var maxQantityRequired = 0,
      preferredFeedstock;

  for (var i in feedstockDetail)
    if (feedstockDetail[i].QuantityInTonnes > maxQantityRequired) {
      maxQantityRequired = feedstockDetail[i].QuantityInTonnes;
      preferredFeedstock = feedstockDetail[i].WasteType;
    }

  return preferredFeedstock;
}

function findFeedstockType(type, feedstockDetail) {
  for (var i in feedstockDetail)
    if (feedstockDetail[i].WasteType == type)
      return feedstockDetail[i];
  return null;
}

function findFeedstockTypes(types, feedstockDetail) {
  var matches = [];

  for (var i in feedstockDetail)
    if (types.indexOf(feedstockDetail[i].WasteType) != -1)
      matches.push(feedstockDetail[i].WasteType);

  return matches;
}

function displayOrganisationDetail(organisations) {

//console.log("detail-organisation_schema", organisations, currentMatrixOrder, organisation_schema.fields)

  document.getElementById("infoBox").innerHTML = "";
  if (organisations.length == 0)
    return;

  document.getElementById("infoPanel").style.visibility = "visible";

  var form = d3.select("#infoBox").append("form");

  form.selectAll("p")
      .data(organisations)
      .enter()
      .append("p")
      .each(function(d) {
        var self = d3.select(this);

        organisation_schema.fields.forEach(function(field) {

          if ((field.display) ||
              ((currentMatrixOrder == "geo_distance") && (field.id == "geo_distance") && (d.identifier != focusOrganisation.identifier))) {
            self.append("label")
                .text(function(d) {
                  return ((field.id == "geo_distance") ?
                                              (field.label + " '" + focusOrganisation.CompanyName + "'") : field.label);
                })
                .style("width", "150px")
                .style("display", "inline-block");

            if (field.type == "text") {
              self.append("input")
                  .attr("type", function(d) { return field.type; })
                  .attr("id", function(d) { return field.id; })
                  .attr("name", function(d) { return field.id; })
                  .attr("disabled", function(d) { return true; })
                  .attr("value", function(d) {
                    if (field.id == "RegistrationDate")
                      return (!d.RegistrationDate || (d.RegistrationDate.getTime() == new Date(0).getTime()) ? "not registered" : formatDateDbY(d[field.id]));
                    else if ((field.id == "geo_distance") && (d.identifier != focusOrganisation.identifier))
                      return (+d.geo_distances[focusOrganisation.identifier]).toFixed(2) + " mi";
                    return d[field.id];
                  })
            }
          } // end check for display field
        });
        self.append("hr");

      })
      .style("width", "175px"); // end - iteration through form elements


  //form.append("button").attr('type', 'submit').text('Save');
}

/*
function generateExtendedCellLabel(graphNode, currentMatrixOrder) {
console.log("generateExtendedCellLabel", graphNode);

  var label = "";

  if (currentMatrixOrder)
    switch(currentMatrixOrder) {
  //    case :
  //      break;
  //
  //    case :
  //          break;

      case "energy_generation":
        break;

      case "environmental_emissions":
        break;

      case "geo_distance":
        label += " driving distance " + graph[graphNode.y].geo_distances[graph[graphNode.x].identifier] + "mi;"
        break;

      default:
        label += "?"
        break;
    }

  return label + currentMatrixOrder + "?";
}
*/

function getIcon(objectType, imageType) {
  if (!imageType)
    imageType = imageSuffixes.ico;

  if (!organisationType[objectType])
    return "https://github.com/favicon.ico";
  // else
  return (iconDirectory + objectIcons[objectType] + imageType);
}
