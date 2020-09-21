// A function that makes a GET request to a given url, expecting json data.
const getJsonData = (url) => {
  return $.ajax({
    url: url,
    type: "GET",
    cors: true,
    dataType: "jsonp",
    secure: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const createGLS = async () => {
  try {
    const URL =
      "https://guidedlearning.oracle.com/player/latest/api/scenario/get/v_IlPvRLRWObwLnV5sTOaw/5szm2kaj/?callback=__5szm2kaj&refresh=true&env=dev&type=startPanel&vars%5Btype%5D=startPanel&sid=none&_=1582203987867";
    const res = await getJsonData(URL);
    if (res.success) {
      alert("Data retrieved successfully");
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
