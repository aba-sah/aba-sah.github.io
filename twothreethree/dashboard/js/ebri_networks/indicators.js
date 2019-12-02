/*
  "standardKpis" : {
    "network": "contact count",
    "similarity": "best match",
    "geo_distance": "distance from plant",
    "feedstock_type": "feedstock type",
    "feedstock_delivery_frequency": "feedstock delivery cycle",
    "weighted_kpi": "estimated service cost",
    "selected_node": "best fit, focus"
  },
 */
var standardIndicator = { csr : "CSR",
                          network_strength : "ContactCount",
                          cost : "cost",
                          product : "product",
                        },


    comparator = {  equals : "equals",
                    gt : "gt",
                    gte : "gte",
                    lt : "lt",
                    lte : "lte",
                  };

function rankEligibleFeedstockSuppliers(focusOrganisation, network, minFeedstockTypes) {

}

function rankPreferredFeedstockSuppliers(focusOrganisation, network, minFeedstockTypes) {
  var preferredFeedstock = focusOrganisation.PreferredFeedstock;
  if (!preferredFeedstock)
    preferredFeedstock = getLargestDeliveryQuantity(focusOrganisation.InputFeedstock);

  var feedstockByQuantityRequired = [];
  focusOrganisation.InputFeedstock.sort(function(a, b) {
    return ((a.QuantityInTonnes < b.QuantityInTonnes) ? 1 :
                              ((a.QuantityInTonnes == b.QuantityInTonnes) ? 0 : -1));
  });
  for (var i in focusOrganisation.InputFeedstock)
    feedstockByQuantityRequired.push(focusOrganisation.InputFeedstock[i].WasteType);


  var matches = [];

  var wasteTypes;
  network.forEach(function(node) {
    if ((node.identifier != focusOrganisation.identifier) && node.Feedstock) {
      wasteTypes = node.Feedstock.reduce(function(result, feedstock) { return result.concat(feedstock.WasteType); }, []);
      if (wasteTypes.indexOf(preferredFeedstock) != -1) {
        if (minFeedstockTypes && (findFeedstockTypes(feedstockByQuantityRequired, node.Feedstock).length < minFeedstockTypes))
          ; // do nothing
        else {
          matches.push(node);
          node.failsMatch.set(standardKpiLabels.selected_node, false);
        }
      }
    }
  });

  if (matches.length > 0) {
    matches.sort(function(a, b) {
      var matchingFeedstockA = findFeedstockType(preferredFeedstock, a.Feedstock),
          matchingFeedstockB = findFeedstockType(preferredFeedstock, b.Feedstock);

      return ((matchingFeedstockA.QuantityInTonnes < matchingFeedstockB.QuantityInTonnes) ? 1 :
                              ((matchingFeedstockA.QuantityInTonnes == matchingFeedstockB.QuantityInTonnes) ? 0 : -1));
    });
  }
//console.log("kpis - matches", matches)

  // sort remaining...
  var nextLargestFeedstock,
      subsequentMatches;
  for (var i in feedstockByQuantityRequired) {
    nextLargestFeedstock = feedstockByQuantityRequired[i];
    if (nextLargestFeedstock == preferredFeedstock)
      continue;

    subsequentMatches = [];
    network.forEach(function(node) {
      if ((node.identifier != focusOrganisation.identifier) && node.Feedstock && (matches.indexOf(node) == -1)) {
        wasteTypes = node.Feedstock.reduce(function(result, feedstock) { return result.concat(feedstock.WasteType); }, []);
        if (wasteTypes.indexOf(nextLargestFeedstock) != -1) {
          if (minFeedstockTypes && (findFeedstockTypes(feedstockByQuantityRequired, node.Feedstock).length < minFeedstockTypes))
            ; // do nothing
          else {
            subsequentMatches.push(node);
            node.failsMatch.set(standardKpiLabels.selected_node, false);
          }  // end if-else
        }
      } // end outer if
    });

    if (subsequentMatches.length > 0) {
      subsequentMatches.sort(function(a, b) {
        var matchingFeedstockA = findFeedstockType(nextLargestFeedstock, a.Feedstock),
            matchingFeedstockB = findFeedstockType(nextLargestFeedstock, b.Feedstock);

        return ((matchingFeedstockA.QuantityInTonnes < matchingFeedstockB.QuantityInTonnes) ? 1 :
                  ((matchingFeedstockA.QuantityInTonnes == matchingFeedstockB.QuantityInTonnes) ? 0 : -1));
      });

      for (var j in subsequentMatches)
        matches.push(subsequentMatches[j]);
    } // end if - sort matches and add to upper level...

  } // end for - iteration through all acceptable input feedstock

  // order by delivery cycle, then contact count
  subsequentMatches = [];
  network.forEach(function(node) {
    if ((node.identifier != focusOrganisation.identifier) && node.Feedstock && (matches.indexOf(node) == -1))
      subsequentMatches.push(node);
  });
  if (subsequentMatches.length > 0) {
    subsequentMatches.sort(function(a, b) {

      var shortestDeliveryCycleA = (a.Feedstock ? getShortestMeanDeliveryCycle(a.Feedstock) : 100),
          shortestDeliveryCycleB = (b.Feedstock ? getShortestMeanDeliveryCycle(b.Feedstock) : 100);
      a.failsMatch.set(standardKpiLabels.selected_node, true);
      b.failsMatch.set(standardKpiLabels.selected_node, true);


//console.log("kpis - rankPreferredFeedstockSuppliers premature end", focusOrganisation.InputFeedstock, preferredFeedstock, feedstockByQuantityRequired, subsequentMatches, matches, sortedNodes);
      if ((shortestDeliveryCycleA == shortestDeliveryCycleB) && (shortestDeliveryCycleA == 100))
        return ((a.NetworkConnections < b.NetworkConnections) ? 1 :
                  ((a.NetworkConnections == b.NetworkConnections) ? 0 : -1));

      return ((shortestDeliveryCycleA < shortestDeliveryCycleB) ? -1 :
                ((shortestDeliveryCycleA == shortestDeliveryCycleB) ? 0 : 1));
    });
  } // end if - sort

  for (var j in subsequentMatches)
    matches.push(subsequentMatches[j]);

  // then everything else...
  subsequentMatches = [];
  network.forEach(function(node) {
    if (!node.identifier.startsWith("subNetwork_") && (node.identifier != focusOrganisation.identifier) && (matches.indexOf(node) == -1))
      subsequentMatches.push(node);
  });
  if (subsequentMatches.length > 0) {
    subsequentMatches.sort(function(a, b) {

      a.failsMatch.set(standardKpiLabels.selected_node, true);
      b.failsMatch.set(standardKpiLabels.selected_node, true);

      return ((a.NetworkConnections < b.NetworkConnections) ? 1 :
                  ((a.NetworkConnections == b.NetworkConnections) ? 0 : -1));
    });
  } // end if - sort

  for (var j in subsequentMatches)
    matches.push(subsequentMatches[j]);

  matches.splice(0, 0, network[focusOrganisation.index]);

  var sortedNodes = [];
  for (var i in matches)
    sortedNodes.push(matches[i].index);

  kpisAvailable.selected_node = sortedNodes;

//console.log("kpis - rankPreferredFeedstockSuppliers", focusOrganisation.InputFeedstock, preferredFeedstock, feedstockByQuantityRequired, subsequentMatches, matches, sortedNodes);
}

function rankByShortestDrivingDistance(kpiOption, focusOrganisation, nodeIndexLookUp, network) {
  var geo_distances = Array.from(nodeIndexLookUp.keys());

  var nodeId;
  for (var i = geo_distances.length; i > 0; i--) {
    nodeId = geo_distances[i - 1];

    if (!focusOrganisation.geo_distances[nodeId])
      geo_distances.splice(geo_distances.indexOf(nodeId), 1);
  }

  var distanceA, distanceB;
  geo_distances.sort(function(a, b) {
    distanceA = +focusOrganisation.geo_distances[a];
    distanceB = +focusOrganisation.geo_distances[b];

    return ((distanceA < distanceB) ? -1 :
                             ((distanceA == distanceB) ? 0 : 1));
  });

  var sortedNodes = [];
  for (var i in geo_distances) {
    network[nodeIndexLookUp.get(geo_distances[i])].failsMatch.set(standardKpiLabels[kpiOption], false);
    sortedNodes.push(nodeIndexLookUp.get(geo_distances[i]));
  }

  kpisAvailable[kpiOption] = sortedNodes;
}

function rankFeedstockSuppliersByFeedstockSupply(kpiOption, focusOrganisation, network) {

  var feedstockByQuantityRequired = [];
  focusOrganisation.InputFeedstock.sort(function(a, b) {
    return ((a.QuantityInTonnes < b.QuantityInTonnes) ? 1 :
                              ((a.QuantityInTonnes == b.QuantityInTonnes) ? 0 : -1));
  });
  for (var i in focusOrganisation.InputFeedstock)
    feedstockByQuantityRequired.push(focusOrganisation.InputFeedstock[i].WasteType);

  var matches = [];

  var wasteTypes,
      noOfMatches = [];
  network.forEach(function(node) {
    if ((node.identifier != focusOrganisation.identifier) && node.Feedstock) {
      wasteTypes = node.Feedstock.reduce(function(result, feedstock) { return result.concat(feedstock.WasteType); }, []);

      noOfMatches.push(node.identifier);
      noOfMatches[node.identifier] = [];
      for (var i in feedstockByQuantityRequired) {
        if (wasteTypes.indexOf(feedstockByQuantityRequired[i]) != -1)
          noOfMatches[node.identifier].push(feedstockByQuantityRequired[i]);
      }
      if (noOfMatches[node.identifier].length > 0) {
        matches.push(node);
        node.failsMatch.set(standardKpiLabels[kpiOption], false);
      }
    }
  });

  if (matches.length > 0) {
    matches.sort(function(a, b) {
      var matchA = noOfMatches[a.identifier],
          matchB = noOfMatches[b.identifier];
      var matchingCountA = matchA.length,
          matchingCountB = matchB.length;

      return ((matchingCountA < matchingCountB) ? 1 :
                              ((matchingCountA == matchingCountB) ? 0 : -1));
    });
  }


  var preferredFeedstock = focusOrganisation.PreferredFeedstock;
  if (!preferredFeedstock)
    preferredFeedstock = getLargestDeliveryQuantity(focusOrganisation.InputFeedstock);

  // sort remaining...
  var nextLargestFeedstock,
      subsequentMatches;
  for (var i in feedstockByQuantityRequired) {
    nextLargestFeedstock = feedstockByQuantityRequired[i];
    if (nextLargestFeedstock == preferredFeedstock)
      continue;

    subsequentMatches = [];
    network.forEach(function(node) {
      if ((node.identifier != focusOrganisation.identifier) && node.Feedstock && (matches.indexOf(node) == -1)) {
        wasteTypes = node.Feedstock.reduce(function(result, feedstock) { return result.concat(feedstock.WasteType); }, []);
        if (wasteTypes.indexOf(nextLargestFeedstock) != -1) {
          if (minFeedstockTypes && (findFeedstockTypes(feedstockByQuantityRequired, node.Feedstock).length < minFeedstockTypes))
            ; // do nothing
          else {
            subsequentMatches.push(node);
            node.failsMatch.set(standardKpiLabels[kpiOption], false);
          }  // end if-else
        } else
          node.failsMatch.set(standardKpiLabels[kpiOption], true);
      } // end outer if
    });

    if (subsequentMatches.length > 0) {
      subsequentMatches.sort(function(a, b) {
        var matchingFeedstockA = findFeedstockType(nextLargestFeedstock, a.Feedstock),
            matchingFeedstockB = findFeedstockType(nextLargestFeedstock, b.Feedstock);

        return ((matchingFeedstockA.QuantityInTonnes < matchingFeedstockB.QuantityInTonnes) ? 1 :
                  ((matchingFeedstockA.QuantityInTonnes == matchingFeedstockB.QuantityInTonnes) ? 0 : -1));
      });

      for (var j in subsequentMatches)
        matches.push(subsequentMatches[j]);
    } // end if - sort matches and add to upper level...

  } // end for - iteration through all acceptable input feedstock

  // order by delivery cycle, then contact count
  subsequentMatches = [];
  network.forEach(function(node) {
    if ((node.identifier != focusOrganisation.identifier) && node.Feedstock && (matches.indexOf(node) == -1))
      subsequentMatches.push(node);
  });
  if (subsequentMatches.length > 0) {
    subsequentMatches.sort(function(a, b) {

      var shortestDeliveryCycleA = (a.Feedstock ? getShortestMeanDeliveryCycle(a.Feedstock) : 100),
          shortestDeliveryCycleB = (b.Feedstock ? getShortestMeanDeliveryCycle(b.Feedstock) : 100);
      a.failsMatch.set(standardKpiLabels[kpiOption], true);
      b.failsMatch.set(standardKpiLabels[kpiOption], true);


//console.log("kpis - rankPreferredFeedstockSuppliers premature end", focusOrganisation.InputFeedstock, preferredFeedstock, feedstockByQuantityRequired, subsequentMatches, matches, sortedNodes);
      if ((shortestDeliveryCycleA == shortestDeliveryCycleB) && (shortestDeliveryCycleA == 100))
        return ((a.NetworkConnections < b.NetworkConnections) ? 1 :
                  ((a.NetworkConnections == b.NetworkConnections) ? 0 : -1));

      return ((shortestDeliveryCycleA < shortestDeliveryCycleB) ? -1 :
                ((shortestDeliveryCycleA == shortestDeliveryCycleB) ? 0 : 1));
    });
  } // end if - sort

  for (var j in subsequentMatches)
    matches.push(subsequentMatches[j]);

  // then everything else...
  subsequentMatches = [];
  network.forEach(function(node) {
    if (!node.identifier.startsWith("subNetwork_") && (node.identifier != focusOrganisation.identifier) && (matches.indexOf(node) == -1))
      subsequentMatches.push(node);
  });
  if (subsequentMatches.length > 0) {
    subsequentMatches.sort(function(a, b) {

      a.failsMatch.set(standardKpiLabels[kpiOption], true);
      b.failsMatch.set(standardKpiLabels[kpiOption], true);

      return ((a.NetworkConnections < b.NetworkConnections) ? 1 :
                  ((a.NetworkConnections == b.NetworkConnections) ? 0 : -1));
    });
  } // end if - sort

  for (var j in subsequentMatches)
    matches.push(subsequentMatches[j]);

  matches.splice(0, 0, network[focusOrganisation.index]);

  var sortedNodes = [];
  for (var i in matches)
    sortedNodes.push(matches[i].index);

  kpisAvailable[kpiOption] = sortedNodes;
}

// already done
//function rankFeedstockSupplyByDeliveryCycle(kpiOption, network) {
//console.log("kpis - matches -- rankFeedstockSupplyByDeliveryCycle")
//
//  var matches = [];
//
//  var wasteTypes,
//      noOfMatches = [],
//      shortestMeanDeliveryCycle;
//  network.forEach(function(node) {
//    if (node.OrganisationType == organisationType.FeedstockSupplier) {
//      matches.push(node);
//      node.failsMatch.set(standardKpiLabels[kpiOption], false);
//    }
//  });
//
//
//  if (matches.length > 0) {
//    matches.sort(function(a, b) {
//      var matchingFeedstockCycleA = getShortestMeanDeliveryCycle(a.Feedstock),
//          matchingFeedstockCycleB = getShortestMeanDeliveryCycle(b.Feedstock);
//
//      return ((matchingFeedstockCycleA < matchingFeedstockCycleB) ? 1 :
//                              ((matchingFeedstockCycleA == matchingFeedstockCycleB) ? 0 : -1));
//    });
//  }
//
//
//  // sort remaining... everything else...
//  var subsequentMatches = [];
//  network.forEach(function(node) {
//    if (!node.identifier.startsWith("subNetwork_") && (matches.indexOf(node) == -1))
//      subsequentMatches.push(node);
//  });
//  if (subsequentMatches.length > 0) {
//    subsequentMatches.sort(function(a, b) {
//
//      a.failsMatch.set(standardKpiLabels[kpiOption], true);
//      b.failsMatch.set(standardKpiLabels[kpiOption], true);
//
//      return ((a.NetworkConnections < b.NetworkConnections) ? 1 :
//                  ((a.NetworkConnections == b.NetworkConnections) ? 0 : -1));
//    });
//  } // end if - sort
//
//  for (var j in subsequentMatches)
//    matches.push(subsequentMatches[j]);
//
//
//  var sortedNodes = [];
//  for (var i in matches)
//    sortedNodes.push(matches[i].index);
//
//  kpisAvailable[kpiOption] = sortedNodes;
//}