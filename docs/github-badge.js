(function () {
  "use strict";
  window.setTimeout(function () {
    var img = document.createElement('img');
    img.style.position = 'absolute';
    img.style.top = '40px';
    img.style.right = 0;
    img.style.border = 0;
    img.src = 'https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67';
    img.alt = 'Fork me on GitHub';
    img.dataCanonicalSrc = 'https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png';
    var a = document.createElement('a');
    a.href = 'https://github.com/knalli/angular-vertxbus';
    a.appendChild(img);
    document.body.appendChild(a);
  }, 150);

})();
