
var organisationType = {  Hub : "Hub",
                          PlantOperator : "PlantOperator",
                          ServiceProvider : "ServiceProvider",
                          AncillaryServiceProvider : "AncillaryServiceProvider",
                          FeedstockSupplier : "FeedstockSupplier",
                          Unknown : "Unknown",
                        },
    objectIcons = { Hub : "ecosystem_hub-icon",
                    PlantOperator : "plant_operator-icon",
                    ServiceProvider : "service_provider_icon",
                    AncillaryServiceProvider : "ancillary_service_provider_icon",
                    FeedstockSupplier : "feedstock_supplier_icon",
                    Unknown : "institution-icon",
                  };


var wasteType = { CafeteriaWaste : "CafeteriaWaste",
                  CleaningProducts : "CleaningProducts",
                  ClinicalWaste : "ClinicalWaste",
                  Cork : "Cork",
                  FoodWaste : "FoodWaste",
                  FoodProcessingResidue : "FoodProcessingResidue",
                  MunicipalSolidWaste : "MunicipalSolidWaste",  // synonym MSW @todo - need a list...
                  OfficeWaste : "OfficeWaste",
                  AgriculturalResidue : "AgriculturalResidue",  // PoultryManure
                  DryArableWaste : "DryArableWaste",
                  BrewerySludge : "BrewerySludge",
                  Sawdust : "Sawdust",
                  WasteWood : "WasteWood",
                  WoodChip : "WoodChip",
                };

var deliveryCycle = [  "daily",
                        "biweekly",
                        "weekly",
                        "fortnightly",
                        "monthly",
                        "quarterly",
                        "semiannually",
                        "yearly",
                      ];
/*
var deliveryCycle = {  daily : 0,
                        biweekly : 1,
                        weekly : 2,
                        fortnightly : 3,
                        monthly : 4,
                        quarterly : 5,
                        semiannually : 6,
                        yearly : 7,
                      };
*/

var unit = {  kilo : "kilo",
              tonne : "tonne",
              mile : "mile",
              poundSterling : "poundSterling",
            }



function Organisation(index, uri, type, sector, name, registrationDate, location) {
  this.index = index;

  this.companyUri = uri;
  this.organisationType = type;
  this.sector = sector;
  this.companyName = name;
  this.registrationDate = registrationDate
  this.primarySite = location;

  this.indicators = new Map();

  if ((type == organisationType.FeedstockSupplier))
    this.feedstock = new Map();
  else if ((type == organisationType.PlantOperator))
    this.inputFeedstock = new Map();
}

function Feedstock(wasteType, quantityInTonnes, deliveryCycle) {
  this.wasteType = wasteType;
  this.quantityInTonnes = quantityInTonnes;
  this.deliveryCycle = deliveryCycle;
}

function listFeedstocksSupplied(organisation, feedstock, overwrite) {
  if (!overwrite && organisation.feedstock.has(feedstock.wasteType)) {
    console.log(organisation.uri + " already has defined feedstock of type " + wasteType + "\n\t" + feedstock);   // do nothing
    return;
  }

  organisation.feedstock.set(feedstock.wasteType, feedstock);
}

function listInputFeedstock(organisation, feedstock, overwrite) {
  if (!overwrite && organisation.inputFeedstock.has(feedstock.wasteType)) {
    console.log(organisation.uri + " already has defined feedstock of type " + wasteType + "\n\t" + feedstock);   // do nothing
    return;
  }

  organisation.inputFeedstock.set(feedstock.wasteType, feedstock);
}

function Indicator(label, description, metricType, unit, input, algorithm, comparison) {
  this.label = label;
  this.description = description;
  this.metricType = metricType;  // label, metric dataType
  this.unit = unit;

  this.input = input; // array with field labels
  this.algorithm = algorithm;
  this.comparison = comparison; // works if quantitative
}

function getIndicatorValue(indicator, organisation) {

  var algorithm = indicator.algorithm;

  var organisationInput = [];
  for (var i in indicator.input)
    organisationInput[i] = organisation[input[i]];

  return runAlgorithm(organisationInput, indicator.algorithm);
}

function compareMetrics(indicator, organisation, targetOrganisation) {

  var algorithm = indicator.algorithm;

  var organisationInput = [],
      targetOrganisationInput = [];
  for (var i in indicator.input) {
    organisationInput[i] = organisation[input[i]];
    targetOrganisationInput[i] = targetOrganisation[input[i]];
  }

  var organisationIndicatorValue = runAlgorithm(organisationInput, indicator.algorithm),
      targetOrganisationIndicatorValue = runAlgorithm(targetOrganisationInput, indicator.algorithm);

  if ((indicator.comparison == comparator.lt) || (indicator.comparison == comparator.lte))
    return ((organisationIndicatorValue < targetOrganisationIndicatorValue) ? -1 :
               ((organisationIndicatorValue == targetOrganisationIndicatorValue) ? 0 : 1));

  else if ((indicator.comparison == comparator.gt) || (indicator.comparison == comparator.gte)) {
    return ((organisationIndicatorValue < targetOrganisationIndicatorValue) ? 1 :
               ((organisationIndicatorValue == targetOrganisationIndicatorValue) ? 0 : -1));
  }
}

function runAlgorithm(input, equation) {

  var myFunction = new Function("args", equation);

  var result = myFunction(input);
  console.log("runAlgorithm", input, equation, result);

  return result;

/* sample algorithm
var input = [6, 3, 7, 5];
var equation = "var x = args[0] + (args[2] * args[1]);\n";
equation += "return x - args[3]";
runAlgorithm(input, equation);
*/
}