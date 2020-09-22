// Global variables
const URL =
  "https://guidedlearning.oracle.com/player/latest/api/scenario/get/v_IlPvRLRWObwLnV5sTOaw/5szm2kaj/?callback=__5szm2kaj&refresh=true&env=dev&type=startPanel&vars%5Btype%5D=startPanel&sid=none&_=1582203987867";
const requestType = "GET";
const dataTypeExpected = "jsonp";

const getJsonData = (url) => {
  return $.ajax({
    url: url,
    type: requestType,
    cors: true,
    dataType: dataTypeExpected,
    secure: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const createTipDiv = (stepsData, stepIndex, stepsCount, tiplates) => {
  // need to check index here, eventhough there shouldnt be a problem because the data tells us when its done
  $("div.sttip").remove();
  // get next from followers field!
  const currentStep = stepsData[stepIndex];
  let tip = $(tiplates.tip);
  tip
    .find("div[data-iridize-id=content]")
    .html(currentStep.action.contents["#content"]);

  tip.find("span[data-iridize-role=stepCount]").html(stepIndex + 1);

  tip.find("span[data-iridize-role=stepsCount]").html(stepsCount);

  const tipDiv =
    `<div class="sttip"><div class="tooltip ${currentStep.action.classes} in ${currentStep.action.placement} panel-container"><div class="popover-inner guide-content">` +
    tip.html() +
    "</div></div></div>";

  tip.addClass(currentStep.action.classes);

  // Adding the new tooltip to the selector's parent
  $(currentStep.action["selector"]).parent().append(tipDiv);

  // $("button[data-iridize-role=laterBt]").on("click", () =>
  //   $("div.tooltip").addClass("showLaterBt")
  // );

  if (currentStep.next) {
    $(currentStep.next.selector).on(currentStep.next.event, () =>
      createTipDiv(stepsData, stepIndex + 1, stepsCount, tiplates)
    );
  }
  if (currentStep.action.roleTexts) {
    Object.keys(currentStep.action.roleTexts).forEach((role) => {
      $(`[data-iridize-role=${role}]`).text(currentStep.action.roleTexts[role]);
    });
  }
  // adding listeners
  $("button[data-iridize-role=closeBt]").on("click", () =>
    $("div.sttip").remove()
  );

  $("a[data-iridize-role=nextBt]").on("click", () =>
    createTipDiv(stepsData, stepIndex + 1, stepsCount, tiplates)
  );
  $("button[data-iridize-role=prevBt]").on("click", () =>
    createTipDiv(stepsData, stepIndex - 1, stepsCount, tiplates)
  );
};

const createGLS = async () => {
  try {
    const res = await getJsonData(URL);
    if (res.success) {
      // Adding provided css
      var style = '<style type="text/css">' + res.data.css + "</style>";
      $("head").append(style);

      // Creating the tooltip according to the JSON data
      // Count number of tips in array
      const tipsCount = res.data.structure.steps.filter(
        (step) => step.action.type === "tip"
      ).length;
      if (tipsCount) {
        createTipDiv(res.data.structure.steps, 0, tipsCount, res.data.tiplates);
      }
    }
  } catch (err) {
    console.log(err);
  }
};

javascript: (function () {
  if (window.location.href === "https://www.google.com/") {
    if (typeof jQuery == "undefined") {
      window.jQuery = "loading";
      var a = document.createElement("script");
      a.type = "text/javascript";
      a.src = "https://code.jquery.com/jquery-3.4.1.min.js";
      a.onload = createGLS;
      a.onerror = function () {
        delete jQuery;
        alert("Error while loading jQuery!");
      };
      document.getElementsByTagName("head")[0].appendChild(a);
    } else {
      if (typeof jQuery == "function") {
        createGLS();
      }
    }
  }
})();
