var settings = new Map();
var settingOptions = {  default_weighting : "default_weighting",
                        default_matrix_order : "default_matrix_order",
                        adjacency_matrix : "adjacency_matrix",
                      }
var shiftKeyDown;

var networkToMatrixMatch = {  network_to_matrix : 0,
                              matrix_to_network : 1,
                            };


function loadSettings(sessionSettings) {
  settings = sessionSettings;
}

function matchNetworkNodeToMatrixCell(nodeId, cellId, matchDirection) {

  var delimiter = "__";
  var nodeIdParts,
      cellIdParts;
  var actorIdXY,
      actorIdX,
      actorIdY;

  if (nodeId) {
    nodeIdParts = nodeId.split(delimiter);
    actorIdXY = nodeIdParts[nodeIdParts.length - 1];
  }
  if (cellId) {
    cellIdParts = cellId.split(delimiter);

    actorIdX = ((cellIdParts.length > 0) ? cellIdParts[0] : null),
    actorIdY = ((cellIdParts.length > 1) ? cellIdParts[1] : null)
  }

  if ((actorIdXY && actorIdY) && (actorIdXY != actorIdY)) {
    console.log("failure in matchNetworkNodeToMatrixCell", actorIdXY, actorIdX, actorIdY)
    return false; // really shouldn't happen...
  }

  if (matchDirection == networkToMatrixMatch.network_to_matrix)  // matrix cell indices
    return [ actorIdXY ];

  else {  //if (matchDirection == networkToMatrixMatch.matrix_to_network) - // networkNodeIndices - 1 or 2
    if (actorIdX == actorIdY)
      return [ actorIdY ];
    else
      return [ actorIdX, actorIdY ]
  }
}

function updateGraph(restart) {
  drawLinks();
  drawNodes();

  simulation
      .nodes(graph)
  simulation.force("link")
            .links(links)

  if (restart)
    simulation
        .alphaTarget(0.3)
        .restart();

console.log("Graph update completed for action '" + triggerAction +
              "' in " + ((new Date()).getTime() - graphUpdateStart) + "ms",
              "Node count: " + graph.length + "; no. of nodes added: " + (graph.length - nodeCount));

//@todo - look at using simulation.alphaDecay() instead - default 1/300 - want something approximating the 5s below
  // never enters simulation.end if alphaTarget not set back to 0
  setTimeout(function() {
    simulation
        .alphaTarget(0);
  }, 5000);
}


//* helper functions */
function dragstarted(d) {
  if (!d3.event.active)
    simulation.alphaTarget(0.3)
              .restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active)
    simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function keyflip() {
  shiftKeyDown = d3.event.shiftKey || d3.event.metaKey;
}
