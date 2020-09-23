// Global variables
const URL =
  "https://guidedlearning.oracle.com/player/latest/api/scenario/get/v_IlPvRLRWObwLnV5sTOaw/5szm2kaj/?callback=__5szm2kaj&refresh=true&env=dev&type=startPanel&vars%5Btype%5D=startPanel&sid=none&_=1582203987867";
const requestType = "GET";
const dataTypeExpected = "jsonp";
let globalStepsArray = [];

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

const findFirstStepByOrdinal = (stepsArray) => {
  const firstStep = stepsArray.reduce((prev, curr) =>
    prev.action.stepOrdinal < curr.action.stepOrdinal ? prev : curr
  );
  if (
    stepsArray.some(
      (step) =>
        step.action.stepOrdinal === firstStep.action.stepOrdinal &&
        step.uid !== firstStep.uid
    )
  ) {
    //  two or more steps with a minimum ordinal, sort them by id
    // Ask about this TODO
  }
  return firstStep;
};

const createTipDiv = (currentStep, stepIndex, stepsCount, tiplates) => {
  console.log(currentStep);
  // Todo not sure this is right
  if (currentStep.action.type === "closeScenario") {
    $("div.sttip").remove();
    return;
  }
  if (currentStep.action.onlyOneTip) {
    $("div.sttip").remove();
  }
  // Todo
  let tip = $(tiplates.tip);
  tip
    .find("div[data-iridize-id=content]")
    .html(currentStep.action.contents["#content"]);

  tip.find("span[data-iridize-role=stepCount]").html(stepIndex + 1);

  tip.find("span[data-iridize-role=stepsCount]").html(stepsCount);

  const tipDiv =
    `<div id=${currentStep.uid} class="sttip"><div class="tooltip ${currentStep.action.classes} in ${currentStep.action.placement} panel-container"><div class="popover-inner guide-content">` +
    tip.html() +
    "</div></div></div>";

  tip.addClass(currentStep.action.classes);

  // Adding the new tooltip to the selector's parent
  $(currentStep.action["selector"]).last().parent().append(tipDiv);
  let tipDomOjbect = $("#" + currentStep.uid);

  if (currentStep.action.roleTexts) {
    Object.keys(currentStep.action.roleTexts).forEach((role) => {
      tipDomOjbect
        .find(`[data-iridize-role=${role}]`)
        .text(currentStep.action.roleTexts[role]);
    });
  }

  // adding listeners
  tipDomOjbect
    .find("button[data-iridize-role=closeBt]")
    .on("click", () => $("#" + currentStep.uid).remove());

  tipDomOjbect
    .find("button[data-iridize-role=laterBt]")
    .on("click", () => $("#" + currentStep.uid).remove());

  // SHOULD ADDRESS CONFITION AND NEXT IN A GENERIC WAY! TODO
  // create one event listener for all conditioned followers
  tipDomOjbect.find("a[data-iridize-role=nextBt]").on("click", () => {
    currentStep.followers.forEach((follower) => {
      var objIndex = globalStepsArray.findIndex(
        (step) => step.id === follower.next
      );
      globalStepsArray[objIndex].previous = currentStep.id;
      if (follower.condition && follower["next"]) {
        createTipDiv(
          globalStepsArray[objIndex],
          stepIndex + 1,
          stepsCount,
          tiplates
        );
      }
    });
  });

  // if the follower doesnt have a condition, create it now
  currentStep.followers.forEach((follower) => {
    if (!follower.condition) {
      var objIndex = globalStepsArray.findIndex(
        (step) => step.id === follower.next
      );
      globalStepsArray[objIndex].previous = currentStep.id;
      createTipDiv(
        globalStepsArray[objIndex],
        stepIndex + 1,
        stepsCount,
        tiplates
      );
    }
  });

  // create parent tip when clicking back
  tipDomOjbect.find("button[data-iridize-role=prevBt]").on("click", () => {
    if (currentStep.previous) {
      var objIndex = globalStepsArray.findIndex(
        (step) => step.id === currentStep.previous
      );
      createTipDiv(
        globalStepsArray[objIndex],
        stepIndex - 1,
        stepsCount,
        tiplates
      );
    }
  });

  // Todo not sure this is right
  if (currentStep.action.watchSelector) {
    $(currentStep.action["selector"])
      .first()
      .on("click", () => {
        tipDomOjbect.find("a[data-iridize-role=nextBt]").trigger("click");
      });
  }
  if (currentStep.next) {
    $(currentStep.next.selector).on(currentStep.next.event, () =>
      tipDomOjbect.find("a[data-iridize-role=nextBt]").trigger("click")
    );
  }
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
        globalStepsArray = res.data.structure.steps;
        const firstStep = findFirstStepByOrdinal(globalStepsArray);
        var objIndex = globalStepsArray.findIndex(
          (step) => step.id === firstStep.id
        );
        globalStepsArray[objIndex].previous = null;
        createTipDiv(firstStep, 0, tipsCount, res.data.tiplates);
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
