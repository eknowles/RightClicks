var currentFrame = "frameLab126-1";
var deviceW = 0; // device width
var deviceH = 0; // device height
var ltr = 1;     // whether reading order is left to right.
var orientationLock = 'unlocked';
var READABLE_FONT_SIZE = 30; // fixing this value at 30 px for children's books now. TODO: Experiment with this value for different children's books.
var COMIC = 'comic';
var CHILDREN = 'children';
var MANGA = 'manga';
var LOADED = 'loaded';
var LOADING = 'loading';
var PAGE_SPREAD_LEFT = "page-spread-left";
var PAGE_SPREAD_RIGHT = "page-spread-right";
var FACING_PAGE_LEFT = "facing-page-left";
var FACING_PAGE_RIGHT = "facing-page-right";
var CENTER = "center";
var INVALID_PAGE_VALUE = -1;
var curBasePage = INVALID_PAGE_VALUE;
var curPairedPage = INVALID_PAGE_VALUE;

function addCustomRules(fId) {
    var frm = document.getElementById(fId.valueOf());
    var sheet = frm.contentDocument.createElement('style');
    sheet.innerHTML = "img { margin: 0px !important; padding: 0px !important;} html::-webkit-scrollbar { width:12px; height:12px; } html::-webkit-scrollbar-track:horizontal { background-color: black; border-bottom: 6px solid white;border-top: 5px solid white; } html::-webkit-scrollbar-track:vertical { background-color: black; border-right: 6px solid white; border-left: 5px solid white; } html::-webkit-scrollbar-thumb:horizontal { background-color: black; border-bottom: 4px solid white; border-top: 3px solid white; } html::-webkit-scrollbar-thumb:vertical { background-color: black;  border-right: 4px solid white; border-left: 3px solid white; }";
    sheet.type = 'text/css';
    frm.contentDocument.getElementsByTagName('head')[0].appendChild(sheet);
}

function loaded() {
    //console.log('frame loaded: ' + event.srcElement.id);
    if (event.srcElement.src != "") {
        if ((deviceW < deviceH) || (orientationLock == 'landscape')) {
            fitLoadedContent(event.srcElement.id, deviceW, deviceH);
        }
        else {
            fitLoadedContent(event.srcElement.id, deviceW/2, deviceH);
        }
    addCustomRules(event.srcElement.id);
    jsCallBack_FrameInfo(parseInt(event.srcElement.getAttribute('page')), event.srcElement.id);
    event.srcElement.setAttribute('data-pageLoadStatus', LOADED);
    }
}

// Position a frame as the left page.
function makeLeftPage(frm, shouldFitContent) {
    frm.style.display = 'inline';
    frm.style.position = 'absolute';
    frm.style.left = '0px';
    frm.style.top = '0px';
    frm.style.margin = '0px';
    frm.style.border = '0px';
    frm.setAttribute('side', 'left');
    if (shouldFitContent == true) {
       fitLoadedContent(frm.id, deviceW/2, deviceH);
    }
}

// Position a frame as the right page.
function makeRightPage(frm, shouldFitContent) {
    frm.style.display = 'inline';
    frm.style.position = 'absolute';
    frm.style.left = parseInt(deviceW/2) + 'px';
    frm.style.top = '0px';
    frm.style.margin = '0px';
    frm.style.border = '0px';
    frm.setAttribute('side', 'right');
    if (shouldFitContent == true) {
        fitLoadedContent(frm.id, deviceW/2, deviceH);
    }
}

function showAndPositionTwoPages(frm1, frm2, isLtr, shouldFitContent) {
    var firstPage = frm1;
    var secondPage = frm2;
    var frames = document.getElementsByTagName('iframe');
    for (i = 0; i < frames.length; i++) {
        if ((frames[i].id != frm1.id) && (frames[i].id != frm2.id)) {
            frames[i].setAttribute('data-frameStatus', 'hidden');
            frames[i].style.display = 'inline';
            frames[i].style.position = 'absolute';
            frames[i].style.left = deviceW + 'px';
            frames[i].style.top = '0px';
        }
    }
    var pageProperty = frm1.getAttribute('data-pageProperty');
    if (pageProperty == PAGE_SPREAD_LEFT || pageProperty == FACING_PAGE_LEFT) {
        makeLeftPage(frm1, shouldFitContent);
        makeRightPage(frm2, shouldFitContent);
    }
    else if (pageProperty == PAGE_SPREAD_RIGHT || pageProperty == FACING_PAGE_RIGHT) {
        makeRightPage(frm1, shouldFitContent);
        makeLeftPage(frm2, shouldFitContent);
    }
    else {
        if (frm1.getAttribute('page') > frm2.getAttribute('page')) {
            firstPage = frm2;
            secondPage = frm1;
        }
        if (isLtr == 1) {
            // first page on left, second page on right.
            makeLeftPage(firstPage, shouldFitContent);
            makeRightPage(secondPage, shouldFitContent);
        }
        else {
            makeRightPage(firstPage, shouldFitContent);
            makeLeftPage(secondPage, shouldFitContent);
        }
    }
}


// Loads two pages in landscape and aligns each of them based on the property of the page.
function loadTwoPages(basePage, pairedPage, basePageProperty, pairedPageProperty, deviceWidth, deviceHeight, isLtr, lock) {
    // clear current pages' statuses before loading new pages.
    var curBaseFrame = findFrameForPage(curBasePage);
    var curPairedFrame = findFrameForPage(curPairedPage);
    if (curBaseFrame != null) {
        curBaseFrame.setAttribute('data-frameStatus', 'hidden');
    }
    if (curPairedFrame != null) {
        curPairedFrame.setAttribute('data-frameStatus', 'hidden');
    }
    deviceW = deviceWidth;
    deviceH = deviceHeight;
    orientationLock = lock;
    ltr = isLtr;
    curBasePage = basePage;
    curPairedPage = pairedPage;
    var frm1 = findFrameForPage(basePage);
    if (frm1 == null) {
        frm1 = getAvailableFrame();
        frm1.setAttribute('data-pageLoadStatus', LOADING);
        frm1.src = "";
        frm1.src = 'kindle:' + parseInt(basePage) + '?mime=text/html';
    }
    frm1.setAttribute('page', parseInt(basePage));
    frm1.setAttribute('data-pageProperty', basePageProperty);
    clearFrameAttributes(frm1);
    currentFrame = frm1.id;
    frm1.setAttribute('data-frameStatus', 'shown');

    var frm2 = findFrameForPage(pairedPage);
    // show both base and paired page; dont fit content at this point since its not loaded yet.
    if (frm2 == null) {
        frm2 = getAvailableFrame();
        frm2.setAttribute('data-pageLoadStatus', LOADING);
        frm2.src = "";
        frm2.src = 'kindle:' + parseInt(pairedPage) + '?mime=text/html';
    }
    clearFrameAttributes(frm2);
    frm2.setAttribute('page', parseInt(pairedPage));
    frm2.setAttribute('data-pageProperty', pairedPageProperty);
    frm2.setAttribute('data-frameStatus', 'shown');
    if (pairedPage == INVALID_PAGE_VALUE) {
        frm2.setAttribute('data-pageLoadStatus', LOADED);
    }
    if (frm1.getAttribute('data-pageLoadStatus') == LOADED) {
         fitLoadedContent(frm1.id, deviceW/2, deviceH);
         jsCallBack_FrameInfo(frm1.getAttribute('page'), frm1.id);
    }
    if (frm2.getAttribute('data-pageLoadStatus') == LOADED) {
         fitLoadedContent(frm2.id, deviceW/2, deviceH);
         jsCallBack_FrameInfo(frm2.getAttribute('page'), frm2.id);
    }
       
}

// Loads a single page in potrait orientation and centers it.
function loadPage(basePage, basePageProperty, deviceWidth, deviceHeight, isLtr, lock) {
    deviceW = deviceWidth;
    deviceH = deviceHeight;
    orientationLock = lock;
    ltr = isLtr;
    // reset current frame's display status to hidden before loading a new page.
    var curBaseFrame = findFrameForPage(curBasePage);
    if (curBaseFrame != null) {
        curBaseFrame.setAttribute('data-frameStatus', 'hidden');
    }
    // check if the page is already loaded in any frame.
    var basePageFrame = findFrameForPage(basePage);
    curBasePage = basePage; 
    if (basePageFrame == null) {
        // CASE 1: initiate new load.
        var frm = getAvailableFrame();
        clearFrameAttributes(frm);
        frm.setAttribute('data-pageLoadStatus', LOADING);
        frm.src = "";
        frm.setAttribute('data-frameStatus', 'shown');
        frm.src = 'kindle:' + parseInt(basePage) + '?mime=text/html';
        frm.setAttribute('page', parseInt(basePage));
        frm.setAttribute('data-pageProperty', basePageProperty);
        currentFrame = frm.id;
        // show one page only; no need to fit content at this point since its not loaded yet.
        makeFullPage(frm, false);
   }
   else {
       // CASE 2: The page load has either already happened/has been initiated by background load.
       // Note: Background loading currently loads ONLY the extra 'couple' page; ONLY for orientation
       // unlocked books, and ONLY when in potrait orientation. So we will hit this case, only in potrait orientation.
       currentFrame = basePageFrame.id;
       basePageFrame.setAttribute('data-frameStatus', 'shown');
       makeFullPage(basePageFrame, false);
       if (basePageFrame.getAttribute('data-pageLoadStatus') == LOADED) {
          console.log('PAGE ALREADY LOADED');
          fitLoadedContent(currentFrame, deviceWidth, deviceHeight);
          jsCallBack_FrameInfo(basePageFrame.getAttribute('page'), basePageFrame.id);
       }
       else {
           console.log('PAGE LOADING INITIATED AND PENDING COMPLETE');
       }
   }
  
}

function setOrientation(deviceWidth, deviceHeight) {
    deviceW = deviceWidth;
    deviceH = deviceHeight;
}

// show two pages.
// ASSUMPTION: The required pages are loaded.
function showTwoPages(basePage, pairedPage) {
    curBasePage = basePage;
    curPairedPage = pairedPage;
    var frame1 = findFrameForPage(basePage);
    currentFrame = frame1.id;
    // do not tamper with the view if we are in panel mode.
    if(frame1.getAttribute('data-panelFitZoom')) {
        showFrame(frame1);
        return;
    }
    var frame2 = findFrameForPage(parseInt(pairedPage));
    showAndPositionTwoPages(frame1, frame2, ltr, true);
}

// shows one page.
// ASSUMPTION: The required page/pages are loaded and ready to be shown.
function showPage(pageNum) {
    var frame1 = findFrameForPage(pageNum);
    showFrame(frame1);
    currentFrame = frame1.id;
    // do not tamper with the view if we are in panel mode.
    if(frame1.getAttribute('data-panelFitZoom')) {
        return;
    }
    curBasePage = pageNum;
    makeFullPage(frame1, true); 
}

// returns reference to a frame that is available to re-use.
function getAvailableFrame() {
    var frames = document.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
        var page = frames[i].getAttribute('page');
        if ((frames[i].getAttribute('data-frameStatus') == 'hidden' && page != curBasePage && page != (curBasePage + 1) && page != (curBasePage - 1)) || page == INVALID_PAGE_VALUE ) {
            return frames[i];
        }  
    }
    return null;
}

function bgLoad(page, pageProperty) {

    var frm = findFrameForPage(page);
    if (deviceW > deviceH && orientationLock != 'landscape') {
        return 1;
    }
    if (frm == null) {
        var availableFrame = getAvailableFrame();
        console.log('Loading an additional page in the background ' + page + ' in frame ' + availableFrame.id);
        clearFrameAttributes(availableFrame);
        availableFrame.setAttribute('data-pageLoadStatus', LOADING);
        availableFrame.setAttribute('data-pageProperty', pageProperty);
        availableFrame.setAttribute('data-frameStatus', 'hidden');
        availableFrame.src = "";
        availableFrame.src = 'kindle:' + parseInt(page) + '?mime=text/html';
        availableFrame.setAttribute('page', parseInt(page));
        return 0; //indicates loading is initiated.
    }
    else {
        return 1; // indicates load has already been initiated.
        //console.log('Nothing to load');
    }
}

function isPageZoomed() {
    var frm = document.getElementById(currentFrame.valueOf());
    var currentZoom = frm.contentWindow.document.body.style.zoom;
    var isZoomed = 1;
    var fitZoom = frm.getAttribute('data-fitZoom');
    var panelFitZoom = frm.getAttribute('data-panelFitZoom');
    if(!panelFitZoom) {
        if (parseFloat(currentZoom) == parseFloat(fitZoom)) {
            isZoomed = 0;
        }
    }
    else {
        if (parseFloat(currentZoom) == parseFloat(panelFitZoom)) {
            isZoomed = 0;
        }
    }
    return parseInt(isZoomed);
}

function prepareBodyStyle(body) {
    body.style.margin = '0px !important';
    body.style.border = '0px !important';
    body.style.cssFloat = 'none';
}

function alignContent(frm, originalWidth , originalHeight, deviceWidth, deviceHeight, alignType) {
    var body = frm.contentDocument.body;
    var contentHeight = originalHeight * body.style.zoom;
    var contentWidth  = originalWidth * body.style.zoom;
    //console.log('original height is ' + originalHeight + 'originalWidth is' + originalWidth);
    //console.log('content width is ' + contentWidth + 'content height is ' + contentHeight);
    var leftOffset = 0;
    var topOffset = 0;
    if(contentWidth < deviceWidth) {
        leftOffset = Math.floor((deviceWidth - contentWidth)/(2 * body.style.zoom));
    }
    if(contentHeight < deviceHeight) {
        topOffset = Math.floor((deviceHeight - contentHeight)/(2 * body.style.zoom));
    }
    // case 1: a page-spread-left is right-aligned i.e no right margin.
    if (alignType == PAGE_SPREAD_LEFT) {
        body.style.cssFloat = 'right';
        body.style.marginTop = topOffset + 'px !important';
    }
    // case 2: a page-spread-right is left-aligned i.e no left margin.
    else if (alignType == PAGE_SPREAD_RIGHT) {
        body.style.marginLeft = parseInt(0) + 'px !important';
        body.style.marginTop = topOffset +'px !important';
    }
    // default behavior is to center the content.
    else { 
        body.style.cssFloat = 'none';
        body.style.marginLeft = leftOffset +'px !important';
        body.style.marginTop = topOffset +'px !important';
    }
    console.log('top is ' + body.style.marginTop  + 'left is ' + body.style.marginLeft);
}

// Moves to the top left quadrant in potrait view and the top half in landscape view.
function topLeft(fId, ratio) {
     var frm = document.getElementById(fId.valueOf());
     var iframeBody = frm.contentWindow.document.body;
     var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
     iframehtml.style.overflow = 'hidden';
     iframeBody.style.zoom = parseFloat(frm.getAttribute('data-fitZoom') * ratio);
     iframeBody.scrollLeft = 0;
     iframeBody.scrollTop = 0;
     frm.setAttribute('data-panelFitZoom', parseFloat(iframeBody.style.zoom));
     frm.setAttribute('data-panelLeft', iframeBody.scrollLeft);
     frm.setAttribute('data-panelTop', iframeBody.scrollTop);
     if (deviceW < deviceH || orientationLock == 'landscape') {
         // panel width is approximately half the content width in quadrant view.
         frm.setAttribute('data-panelWidth', (frm.getAttribute('data-originalWidth') * iframeBody.style.zoom)/ratio);
     }
     else {
         // panel width is the same as content width in half page view.
         frm.setAttribute('data-panelWidth', frm.getAttribute('data-originalWidth') * iframeBody.style.zoom);
     }
     frm.setAttribute('data-panelHeight',((frm.getAttribute('data-originalHeight') * iframeBody.style.zoom)/ratio));
}

// Moves to the top right quadrant in potrait view.
function topRight(fId, ratio) {
     var frm = document.getElementById(fId.valueOf());
     var iframeBody = frm.contentWindow.document.body;
     var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
     iframehtml.style.overflow = 'hidden';
     iframeBody.style.zoom = parseFloat(frm.getAttribute('data-fitZoom') * ratio);
     iframeBody.scrollLeft = iframeBody.scrollWidth - iframeBody.clientWidth;
     iframeBody.scrollTop = 0;
     frm.setAttribute('data-panelFitZoom', parseFloat(iframeBody.style.zoom));
     frm.setAttribute('data-panelLeft', iframeBody.scrollLeft);
     frm.setAttribute('data-panelTop', iframeBody.scrollTop);
     frm.setAttribute('data-panelWidth', (frm.getAttribute('data-originalWidth') * iframeBody.style.zoom)/ratio);
     frm.setAttribute('data-panelHeight',(frm.getAttribute('data-originalHeight') * iframeBody.style.zoom)/ratio);
}

// Moves to the bottom left quadrant in potrait view and the bottom half in landscape view.
function bottomLeft(fId, ratio) {
     var frm = document.getElementById(fId.valueOf());
     var iframeBody = frm.contentWindow.document.body;
     var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
     iframehtml.style.overflow = 'hidden';
     iframeBody.style.zoom = parseFloat(frm.getAttribute('data-fitZoom') * ratio);
     iframeBody.scrollLeft = 0;
     iframeBody.scrollTop = iframeBody.scrollHeight - iframeBody.clientHeight;
     frm.setAttribute('data-panelFitZoom', parseFloat(iframeBody.style.zoom));
     frm.setAttribute('data-panelLeft', iframeBody.scrollLeft);
     frm.setAttribute('data-panelTop', iframeBody.scrollTop);
     if (deviceW < deviceH || orientationLock == 'landscape') {
         // panel width approximately half the content width in quadrant view.
         frm.setAttribute('data-panelWidth', (frm.getAttribute('data-originalWidth') * iframeBody.style.zoom)/ratio);
     }
     else {
         // panel width is the same as content width in the half page view.
         frm.setAttribute('data-panelWidth', frm.getAttribute('data-originalWidth') * iframeBody.style.zoom);
     }
     frm.setAttribute('data-panelHeight',(frm.getAttribute('data-originalHeight') * iframeBody.style.zoom)/ratio);
}

// Moves to the bottom right quadrant in potrait view.
function bottomRight(fId, ratio) {
     var frm = document.getElementById(fId.valueOf());
     var iframeBody = frm.contentWindow.document.body;
     var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
     iframehtml.style.overflow = 'hidden';
     iframeBody.style.zoom = parseFloat(frm.getAttribute('data-fitZoom') * ratio);
     iframeBody.scrollLeft = iframeBody.scrollWidth - iframeBody.clientWidth;
     iframeBody.scrollTop = iframeBody.scrollHeight - iframeBody.clientHeight;
     frm.setAttribute('data-panelFitZoom', parseFloat(iframeBody.style.zoom));
     frm.setAttribute('data-panelLeft', iframeBody.scrollLeft);
     frm.setAttribute('data-panelTop', iframeBody.scrollTop);
     frm.setAttribute('data-panelWidth', (frm.getAttribute('data-originalWidth') * iframeBody.style.zoom)/ratio);
     frm.setAttribute('data-panelHeight',(frm.getAttribute('data-originalHeight') * iframeBody.style.zoom)/ratio);
}

function getOffsetLeft(fId) {
    var frm = document.getElementById(fId.valueOf());
    return frm.offsetLeft;
}

function getOffsetTop(fId) {
    var frm = document.getElementById(fId.valueOf());
    return frm.offsetTop;
}

// find the frame that has a particular page loaded.
function findFrameForPage(pageNum) {
    var frames = document.getElementsByTagName('iframe');
    var i = 0;
    for (i = 0; i < frames.length; i++) {
        var page = frames[i].getAttribute('page');
        if (page == pageNum) {
            //console.log('page number is' + page);
            return frames[i];
        }
    }
    return null;
}

// show frame and hide the rest of the frames.
function showFrame(frm) {
    var frames = document.getElementsByTagName('iframe');
    var i = 0;
    for (i = 0; i < frames.length; i++) {
        var id = frames[i].id;
        if (id == frm.id) {
            frames[i].style.display = 'inline';
        }
        else {
            frames[i].style.display = 'inline';
            frames[i].style.position = 'absolute';
            frames[i].style.left = deviceW + 'px';
            frames[i].style.top = '0px';
            frames[i].setAttribute('data-frameStatus', 'hidden'); 
        }
    }
    frm.style.position = 'absolute';
    frm.style.left = '0px';
    frm.style.top = '0px';
    frm.style.margin = '0px';
    frm.style.border = '0px';
}

// make a particular frame occupy full device width and height, and push the remaining
// frames out of view, and fit the content to device width and height if required.
function makeFullPage(frm, shouldFitContent) {
    showFrame(frm);
    if (shouldFitContent == true) {
        fitLoadedContent(frm.id, deviceW, deviceH);
    }
}

function storeTransitionValues(dstPage, dstPanel, srcPage, srcPanel, totalFrames) {
    var frm = findFrameForPage(dstPage);
    var deltaX = 0;
    var deltaY = 0;
    var targetX = 0;
    var targetY = 0;
    var sourceX = 0;
    var sourceY = 0;
    var frm = findFrameForPage(dstPage);
    var srcFrm = findFrameForPage(srcPage);
     var iframeBody = frm.contentWindow.document.body;

    var trX = iframeBody.scrollWidth - iframeBody.clientWidth;
    var trY = 0;
    var tlX = 0;
    var tlY = 0;
    var brX = iframeBody.scrollWidth - iframeBody.clientWidth;
    var brY = iframeBody.scrollHeight - iframeBody.clientHeight;
    var blX = 0;
    var blY = iframeBody.scrollHeight - iframeBody.clientHeight;


    switch(srcPanel.valueOf()) {
    case 'tr':
        sourceX = trX;
        sourceY = trY;
        break;
    case 'tl':
        sourceX = tlX;
        sourceY = tlY;
        break;
    case 'br':
        sourceX = brX;
        sourceY = brY;
        break;
    case 'bl':
        sourceX = blX;
        sourceY = blY;
        break;
    case 'top':
        if (srcFrm.getAttribute('side') == 'left') {
            sourceX = tlX;
            sourceY = tlY;
        } else { 
            sourceX = trX;
            sourceY = trY;
        }
        break;
    case 'bottom':
        if (srcFrm.getAttribute('side') == 'left') {
            sourceX = blX;
            sourceY = blY;
        } else { 
            sourceX = brX;
            sourceY = brY;
        }
        break;
    } // End switch srcPanel.

    switch(dstPanel.valueOf()) {
    case 'tl':
        targetX = tlX;
        targetY = tlY;
        break;
    case 'tr':
        targetX = trX;
        targetY = trY;
        break;
    case 'br':
        targetX = brX;
        targetY = brY;
        break;
    case 'bl':
        targetX = blX;
        targetY = blY;
        break;
    case 'top':
        if (frm.getAttribute('side') == 'left') {
            targetX = tlX;
            targetY = tlY;
        } else { 
            targetX = trX;
            targetY = trY;
        }
        break;
    case 'bottom':
        if (frm.getAttribute('side') == 'left') {
            targetX = blX;
            targetY = blY;
        } else {
            targetX = brX;
            targetY = brY;
        }
        break;
    } // End switch dstPanel.
    
    frm.setAttribute('transition-dstPage', parseInt(dstPage));
    frm.setAttribute('transition-dstPanel', dstPanel);
    frm.setAttribute('transition-srcPage', parseInt(srcPage));
    frm.setAttribute('transition-srcPanel', srcPanel);
    frm.setAttribute('transition-totalFrames', parseInt(totalFrames));
    frm.setAttribute('transition-distanceX', parseInt(targetX - sourceX));
    frm.setAttribute('transition-distanceY', parseInt(targetY - sourceY)); 
   
}

// Provide animation effect by panning to the frame (of totalFrames)
// from virtual panel to virtual panel.
// The caller should call the regular gotoVirtualPanel for the last frame.
// TODO make the transition work for 2page view.
function transitToVirtualPanel(dstPage, dstPanel, srcPage, srcPanel, frame, totalFrames, zoomRatio) {
    if (frame == 1) {
        gotoVirtualPanel(srcPage, srcPanel, zoomRatio); 
    }
    var frm = findFrameForPage(dstPage);
    var storedDstPage = parseInt(frm.getAttribute('transition-dstPage'));
    var storedDstPanel = frm.getAttribute('transition-dstPanel');
    var storedSrcPage = parseInt(frm.getAttribute('transition-srcPage'));
    var storedSrcPanel = frm.getAttribute('transition-srcPanel');
    var storedTotalFrames = parseInt(frm.getAttribute('transition-totalFrames'));
    if (frame == 1 || storedDstPage != dstPage || storedDstPanel != dstPanel 
        || storedSrcPage != srcPage || storedSrcPanel != srcPanel 
        || storedTotalFrames != totalFrames) {
        // Recalculate the delta values for panning.
        storeTransitionValues(dstPage, dstPanel, srcPage, srcPanel, totalFrames);
    }

    var distanceX = parseInt(frm.getAttribute('transition-distanceX'));
    var distanceY = parseInt(frm.getAttribute('transition-distanceY'));
    if (frame < totalFrames) {
        // deltaX = dx/2, dx/4 etc progressively; similarly for deltaY.
        var deltaX = parseInt(distanceX/Math.pow(2, frame));
        var deltaY = parseInt(distanceY/Math.pow(2, frame));
        panViewAllowOverwrite(deltaX, deltaY, 1);
    }
    else {
       // make sure that the last frame in the animation sequence always settles correctly on the
       // next panel with the appropriate zoom level.
       var currentZoom = frm.contentDocument.body.style.zoom;
       var panelFitZoom = frm.getAttribute('data-panelFitZoom');
       var fitZoom = frm.getAttribute('data-fitZoom');
       var zoomChanged = 0;
       if (currentZoom != panelFitZoom) {
           zoomChanged = 1;
       }
       if (zoomChanged == 1) {
           frm.contentDocument.body.style.zoom = panelFitZoom;
       }
       var iframeBody = frm.contentDocument.body;
       var iframehtml = frm.contentDocument.getElementsByTagName('html')[0];
       iframehtml.style.overflow = 'hidden';
       var preScrollLeft = iframeBody.scrollLeft;
       var preScrollTop = iframeBody.scrollTop;
       gotoVirtualPanelInFrame(frm, dstPanel, (panelFitZoom/fitZoom));
       frm.setAttribute('data-deltaX', parseInt(preScrollLeft - iframeBody.scrollLeft));
       frm.setAttribute('data-deltaY', parseInt(preScrollTop - iframeBody.scrollTop));
       if (zoomChanged == 1) {
           prepareBodyStyle(frm.contentDocument.body);
           // center content in the frame.
           alignContent(frm, parseInt(frm.getAttribute('data-originalWidth')), parseInt(frm.getAttribute('data-originalHeight')), deviceW, deviceH, CENTER);
       }
       return zoomChanged;
    }
}

// goto a particular virtual panel in a frame.
function gotoVirtualPanelInFrame(frm, panel, ratio) {
    switch(panel.valueOf()) {
        case 'tr':
            topRight(frm.id, ratio);
            break;
        case 'tl':
            topLeft(frm.id, ratio);
            break;
        case 'br':
            bottomRight(frm.id, ratio);
            break;
        case 'bl':
            bottomLeft(frm.id, ratio);
            break;
        case 'top':
            topLeft(frm.id, ratio);
            break;
        case 'bottom':
            bottomLeft(frm.id, ratio);
            break;
    }
}

// goto a particular virtual panel in a page
/** 
 * tr, tl, br, bl, top, bottom
 */
function gotoVirtualPanel(pageNum, panel, ratio) {
    clearFrameAttributes(document.getElementById(currentFrame.valueOf()));
    var frm = findFrameForPage(pageNum);
    resetFrameSize(frm);
    currentFrame = frm.id; // this frame is the active frame.
    if (deviceW < deviceH ||  orientationLock == 'landscape')   {
        makeFullPage(frm, true);
    }
    else {
        var frame1 = findFrameForPage(curBasePage);
        var frame2 = findFrameForPage(curPairedPage);
        showAndPositionTwoPages(frame1, frame2, ltr, true);
    }
    gotoVirtualPanelInFrame(frm, panel, ratio);
    // for virtual panels in landscape mode, after applying zoom factor, resize the frame to screen size.
    // hide the other frame.
    if (deviceW > deviceH && orientationLock != 'landscape') {
        setFrameSize(frm, deviceW, deviceH);
        showFrame(frm);
    }
    prepareBodyStyle(frm.contentDocument.body);
    // center content in the frame.
    alignContent(frm, parseInt(frm.getAttribute('data-originalWidth')), parseInt(frm.getAttribute('data-originalHeight')), deviceW, deviceH, CENTER);
    frm.setAttribute('data-panelType', MANGA);
}

function resetFrameSize(frm) {
    frm.style.width = '';
    frm.style.height = '';
}

function setFrameSize(frm, width , height) {
    frm.style.width = width + 'px';
    frm.style.height = height + 'px';
    //console.log('frame width is ' + frm.style.width + ' and height is ' + frm.style.height);
}

function fitLoadedContent(fId, deviceWidth, deviceHeight) {
    //reset the properties of the iframes container.
    var divScroll = document.getElementById('divScroll');
    divScroll.style.overflow = 'hidden';
    divScroll.scrollLeft = 0;
    divScroll.scrollTop = 0;
    
    var frm = document.getElementById(fId.valueOf());
    var iframeBody = frm.contentDocument.body;
    prepareBodyStyle(iframeBody);
    resetFrameSize(frm);
    var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
    iframehtml.style.overflow = 'hidden';

    var originalWidth = 0;
    var originalHeight = 0;
    if (!frm.getAttribute('data-originalWidth') && !frm.getAttribute('data-originalHeight')) {
        iframeBody.style.zoom = 1.0;
        originalWidth = iframeBody.scrollWidth;
        originalHeight = iframeBody.scrollHeight;
    }
    else {
        originalWidth = parseInt(frm.getAttribute('data-originalWidth'));
        originalHeight = parseInt(frm.getAttribute('data-originalHeight'));
    }

    var wRatio = deviceWidth / originalWidth;
    var hRatio = deviceHeight / originalHeight;
    var fitZoom = 1.0 * Math.min(wRatio, hRatio);
    var fitZoomAttr = frm.getAttribute('data-fitZoom');
    frm.setAttribute('data-fitZoom', parseFloat(fitZoom));
    console.log('fit zoom is ' + parseFloat(frm.getAttribute('data-fitZoom')));
   
    iframeBody.style.zoom = fitZoom;
    var alignType = CENTER;
    // align content based on page properties in landscape orientation.
    if (deviceW > deviceH && orientationLock != 'landscape') {
        if (frm.getAttribute('data-pageProperty')) {
            alignType = frm.getAttribute('data-pageProperty');
        }
    }
    alignContent(frm, originalWidth, originalHeight, deviceWidth, deviceHeight, alignType);
    // set frame size after determining the zoom factor to fit content to screen.
    setFrameSize(frm, deviceWidth, deviceHeight);
    frm.setAttribute('data-originalWidth', originalWidth);
    frm.setAttribute('data-originalHeight', originalHeight);
}

// Given a double tap location on the screen, finds the frame that it corresponds to.
function getFrameAtLocation(x, y) {
    
    if (deviceW > deviceH && orientationLock != 'landscape') {
        var divScroll = document.getElementById('divScroll');
        var sTop = divScroll.scrollTop;
        var sLeft = divScroll.scrollLeft;
        var newX = parseInt(sLeft) + x;
        var newY = parseInt(sTop) + y;
        var frames = document.getElementsByTagName('iframe');
        var i = 0;
        for (i = 0; i < frames.length; i++) {
            var frm = frames[i];
            var left = parseInt(frm.offsetLeft);
            var right= parseInt(frm.offsetLeft) + parseInt(frm.style.width);
            var top = parseInt(frm.offsetTop);
            var bottom = parseInt(frm.offsetTop) + parseInt(frm.style.height);
            if (newX >= left && newX <= right && newY >= top && newY <= bottom) {
                return frm.id;
           }
       }
       return '';
  
    }
    else {
        // in potrait orientation, there is only one visible frame which is the active frame.
        return currentFrame;
    }

}

function zoomTwoPageView(x, y, ratio) {
    // TODO: get references to the two frames holding the current two pages.
    var divScroll = document.getElementById('divScroll');
    var frm1 = findFrameForPage(curBasePage);
    var frm2 = findFrameForPage(curPairedPage);

    var frm1body = frm1.contentDocument.body;
    var frm2body = frm2.contentDocument.body;
    prepareBodyStyle(frm1body);
    prepareBodyStyle(frm2body);

    var absX = divScroll.scrollLeft + x;
    var absY = divScroll.scrollTop + y;
    divScroll.style.width = deviceW + 'px';
    divScroll.style.height = deviceH + 'px';

    var curZoom1 = frm1body.style.zoom;
    // apply zoom level to both frames. 
    var newZoom1 = Math.min(curZoom1 * ratio, 3.0);
    newZoom1 = Math.max(newZoom1, frm1.getAttribute('data-fitZoom') * 1.0);
    frm1body.style.zoom = newZoom1;
    var ratio1 = newZoom1/curZoom1;

    var curZoom2 = frm2body.style.zoom;
    var newZoom2 = Math.min(curZoom2 * ratio, 3.0);
    newZoom2 = Math.max(newZoom2, frm2.getAttribute('data-fitZoom') * 1.0); 
    frm2body.style.zoom = newZoom2;
    var ratio2 = newZoom2/curZoom2;

    var frm1fitZoom = frm1.getAttribute('data-fitZoom');
    var frm2fitZoom = frm2.getAttribute('data-fitZoom');

    // if one of the frames has the fit-screen zoom factor on it, fit both frames back to screen.
    if((newZoom1 <= frm1fitZoom) || (newZoom2 <= frm2fitZoom)) {
        //console.log('fit both frames back to screen');
        frm1body.style.zoom = frm1fitZoom;
        frm2body.style.zoom = frm2fitZoom;
        showAndPositionTwoPages(frm1, frm2, ltr, true);
        return;
    }

    frm1.style.position = 'static';
    frm2.style.position = 'static';
    frm1.style.margin = '0px';
    frm2.style.margin = '0px';

    setFrameSize(frm1, parseInt(frm1.style.width) * ratio1, parseInt(frm1.style.height) * ratio1);
    setFrameSize(frm2, parseInt(frm2.style.width) * ratio2, parseInt(frm2.style.height) * ratio2);
    if(frm1.getAttribute('side') == 'left') {
        // frame 2 is on the right.
        frm2.style.marginLeft = (parseInt(frm1.style.width) - frm2.offsetLeft) + 'px';
        // frame 1 is on the left.
        frm1.style.marginLeft = (-frm1.offsetLeft) + 'px'; 
    }
    else {    
        // frame 1 is on the right.
        frm1.style.marginLeft = (parseInt(frm2.style.width) - frm1.offsetLeft) + 'px'; 
        // frame 2 on the left.
        frm2.style.marginLeft = (-frm2.offsetLeft) + 'px';
    }

    frm1.style.marginTop = -frm1.offsetTop + 'px';
    frm2.style.marginTop = -frm2.offsetTop + 'px';
    
    if(divScroll.clientWidth < divScroll.scrollWidth) {
        var newX = absX * ratio;
        divScroll.scrollLeft = newX - x;
        divScroll.style.overflowX = 'scroll';
    }
    else {
        divScroll.style.overflowX = 'hidden';
    }
    if(divScroll.clientHeight < divScroll.scrollHeight) {
        var newY = absY * ratio;
        divScroll.scrollTop = newY - y;
        divScroll.style.overflowY = 'scroll';
    }
    else {
        divScroll.style.overflowY = 'hidden';
    }
    alignContent(frm1, frm1.getAttribute('data-originalWidth'), frm1.getAttribute('data-originalHeight'), parseInt(frm1.style.width), parseInt(frm1.style.height), frm1.getAttribute('data-pageProperty'));
    alignContent(frm2, frm2.getAttribute('data-originalWidth'), frm2.getAttribute('data-originalHeight'), parseInt(frm2.style.width), parseInt(frm2.style.height), frm2.getAttribute('data-pageProperty'));
}

function zoomViewAt(x, y, ratio) {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelZoom = frm.getAttribute('data-panelFitZoom');
    // check if in landscape view, with two pages shown. we should not be in panel view either.
    if (deviceW > deviceH && orientationLock != 'landscape' && !panelZoom) {
        zoomTwoPageView(x, y, ratio);
        return;
    }
    var iframeBody = frm.contentWindow.document.body;
    prepareBodyStyle(iframeBody);
    var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
    iframehtml.style.overflow = 'hidden';

    var curZoom = iframeBody.style.zoom;
    var newZoom = Math.min(curZoom * ratio, 3.0);
    var fitZoom = frm.getAttribute('data-fitZoom');
    if (!panelZoom) {
        newZoom = Math.max(newZoom, parseFloat(fitZoom) * 1.0);
    }
    else {
        newZoom = Math.max(newZoom, parseFloat(panelZoom) * 1.0);
    }
    var absX = iframeBody.scrollLeft + x;
    var absY = iframeBody.scrollTop + y;
    iframeBody.style.zoom = newZoom;
    if (iframeBody.clientWidth < iframeBody.scrollWidth) {
        var newX = absX * (newZoom/curZoom);
        iframeBody.scrollLeft = newX - x;
    }
    if (iframeBody.clientHeight < iframeBody.scrollHeight) {
        var newY = absY * (newZoom/curZoom);
        iframeBody.scrollTop = newY - y;
    }
    iframehtml.style.overflowX = 'hidden';
    iframehtml.style.overflowY = 'hidden';

    // check for the presence of a publisher defined panel.
    var panelTargetId = frm.getAttribute('data-panelTargetId');

    var originalPanelLeft = 0;
    var originalPanelTop = 0;    
    // update panel left, top, width and height values after the new zoom is applied.
    if (panelZoom) {
        var panelLeft = parseInt(frm.getAttribute('data-panelLeft'));
        var panelTop = parseInt(frm.getAttribute('data-panelTop'));
        var panelWidth = parseInt(frm.getAttribute('data-panelWidth'));
        var panelHeight = parseInt(frm.getAttribute('data-panelHeight'));
        originalLeft = panelLeft;
        originalTop = panelTop;
        frm.setAttribute('data-panelWidth', panelWidth * (newZoom/curZoom));
        frm.setAttribute('data-panelHeight' , panelHeight * (newZoom/curZoom));
        frm.setAttribute('data-panelLeft', panelLeft * (newZoom/curZoom));
        frm.setAttribute('data-panelTop' , panelTop * (newZoom/curZoom));
    }

    // do not add scrollbars when we reach panel-fit-to-screen.
    if (newZoom == panelZoom) {
        // restore scroll top and scroll left.
        if (panelTargetId) {
            iframeBody.scrollLeft = 0;
            iframeBody.scrollTop =  0;
        }
        else {
            iframeBody.scrollLeft = parseInt(frm.getAttribute('data-panelLeft'));
            iframeBody.scrollTop = parseInt(frm.getAttribute('data-panelTop'));            
        }
    }
    else {
        addScrollBars();
    }

    if (panelTargetId) {
        // center publisher defined panel.
        centerPanel(frm, panelTargetId, deviceW, deviceH);
        // retrieve the new top and left values after centering the panel in the page after the new zoom level is applied.
        var panelLeft = parseFloat(frm.getAttribute('data-panelLeft'));
        var panelTop = parseFloat(frm.getAttribute('data-panelTop'));
        // account for the change in top and left offsets of the panel.
        if (newZoom != panelZoom) {
            iframeBody.scrollTop = iframeBody.scrollTop - ((originalTop - panelTop) * (newZoom/curZoom));
            iframeBody.scrollLeft = iframeBody.scrollLeft - ((originalLeft - panelLeft) * (newZoom/curZoom));
        }
        
    }
    else {
        alignContent(frm, frm.getAttribute('data-originalWidth'), frm.getAttribute('data-originalHeight'), deviceW, deviceH, CENTER);
    }
}

function getScrollTop(fId) {
    var frm = document.getElementById(fId.valueOf());
    if (deviceW > deviceH && orientationLock != 'landscape') {
        var divScroll = document.getElementById('divScroll');
        return divScroll.scrollTop;
    }
    else {
        return frm.contentDocument.body.scrollTop; 
    }
}

function getScrollLeft(fId) {
    var frm = document.getElementById(fId.valueOf());
    if (deviceW > deviceH && orientationLock != 'landscape') {
        var divScroll = document.getElementById('divScroll');
        return  divScroll.scrollLeft;
    }
    else {
        return frm.contentDocument.body.scrollLeft;
    }
}

function getOffsetTop(fId) {
    var frm = document.getElementById(fId.valueOf());
    return parseInt(frm.offsetTop);
}

function getOffsetLeft(fId) {
    var frm = document.getElementById(fId.valueOf());
    return parseInt(frm.offsetLeft);
}

function getPageInFrame(fId) {
    var frm = document.getElementById(fId.valueOf());
    return parseInt(frm.getAttribute('page'));
}

function addScrollBars() {
    var scrollX = 0;
    var scrollY = 0;
    var frm = document.getElementById(currentFrame.valueOf());
    var iframeBody = frm.contentWindow.document.body;
    var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
    if (iframeBody.clientWidth < iframeBody.scrollWidth) {
        scrollX = 1;
    }
    else {
        iframehtml.style.overflowX = 'hidden';
    }
    if (iframeBody.clientHeight < iframeBody.scrollHeight) {
        scrollY = 1;
    }
    else {
       iframehtml.style.overflowY = 'hidden';
    }
    if (scrollX == 1) {
        iframehtml.style.overflowX = 'scroll';
    }
    if (scrollY == 1) {
        iframehtml.style.overflowY = 'scroll';
    }
    if (scrollX != 1 && scrollY != 1) {
        fitLoadedContent(currentFrame, deviceW, deviceH);
    }
}

function panTwoPageView(deltaX, deltaY) {
    var divScroll = document.getElementById('divScroll');
    var preScrollLeft = divScroll.scrollLeft;
    var preScrollTop = divScroll.scrollTop;
    divScroll.scrollLeft = divScroll.scrollLeft + deltaX;
    divScroll.scrollTop = divScroll.scrollTop + deltaY;
    divScroll.setAttribute('data-deltaX', parseInt(preScrollLeft - divScroll.scrollLeft));
    divScroll.setAttribute('data-deltaY', parseInt(preScrollTop - divScroll.scrollTop));
}

function panVirtualPanel(frm) {
    var iframehtml = frm.contentDocument.getElementsByTagName('html')[0];
    var iframeBody = frm.contentDocument.body;
    var panelLeft = 0;
    var panelTop = 0;
    var panelWidth = 0;
    var panelHeight = 0;
    if (frm.getAttribute('data-panelLeft')) {
        panelLeft = parseInt(frm.getAttribute('data-panelLeft'));
    }
    if (frm.getAttribute('data-panelWidth')) {
        panelWidth = parseInt(frm.getAttribute('data-panelWidth'));
    }
    if (frm.getAttribute('data-panelTop')) {
        panelTop = parseInt(frm.getAttribute('data-panelTop'));
    }
    if (frm.getAttribute('data-panelHeight')) {
        panelHeight = parseInt(frm.getAttribute('data-panelHeight'));
    }
    var originalScrollLeft = iframeBody.scrollLeft;
    var originalScrollTop = iframeBody.scrollTop;
   
    if (originalScrollLeft < panelLeft || originalScrollLeft > (panelLeft + panelWidth - deviceW)) {
        iframeBody.scrollLeft = Math.min(originalScrollLeft, (panelLeft + panelWidth - deviceW));
        iframeBody.scrollLeft = Math.max(iframeBody.scrollLeft, panelLeft);
    }
    if (originalScrollTop < panelTop || originalScrollTop > (panelTop + panelHeight - deviceH)) {
        iframeBody.scrollTop = Math.min(originalScrollTop, (panelTop + panelHeight - deviceH));
        iframeBody.scrollTop = Math.max(iframeBody.scrollTop, panelTop);
    }
}

function panPublisherPanel(frm) {
    var iframehtml = frm.contentDocument.getElementsByTagName('html')[0];
    var iframeBody = frm.contentDocument.body;
    var panelLeft = 0;
    var panelTop = 0;
    var panelWidth = 0;
    var panelHeight = 0;
    if (frm.getAttribute('data-scrollWidth')) {
        panelWidth = parseInt(frm.getAttribute('data-scrollWidth'));
    }
    if (frm.getAttribute('data-scrollHeight')) {
        panelHeight = parseInt(frm.getAttribute('data-scrollHeight'));
    }
    var originalScrollLeft = iframeBody.scrollLeft;
    var originalScrollTop = iframeBody.scrollTop;
   
    if (originalScrollLeft > panelWidth) {
        iframeBody.scrollLeft = Math.min(originalScrollLeft, panelWidth);
    }
    if (originalScrollTop > panelHeight) {
        iframeBody.scrollTop = Math.min(originalScrollTop, panelHeight);
    }

}

function panViewAllowOverwrite(deltaX, deltaY, forcePan) {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelZoom = frm.getAttribute('data-panelFitZoom');
    // check if in landscape view, with two pages shown. we should not be in panel view either.
    if (deviceW > deviceH && orientationLock != 'landscape' && !panelZoom) {
        panTwoPageView(deltaX, deltaY);
        return;
    }
    var iframeBody = frm.contentWindow.document.body;
    var iframehtml = frm.contentWindow.document.getElementsByTagName('html')[0];
    var preScrollLeft = iframeBody.scrollLeft;
    var preScrollTop = iframeBody.scrollTop;
    iframeBody.scrollLeft = iframeBody.scrollLeft + deltaX;
    iframeBody.scrollTop = iframeBody.scrollTop + deltaY;

    if (panelZoom  && forcePan == 0) {  
        var panelType = frm.getAttribute('data-panelType');
        // not restricting panning in case of childrens books.
        if (panelType == COMIC) {
            panPublisherPanel(frm);
        }
        else if (panelType == MANGA){
            panVirtualPanel(frm);
        }
    }
    frm.setAttribute('data-deltaX', parseInt(preScrollLeft - iframeBody.scrollLeft));
    frm.setAttribute('data-deltaY', parseInt(preScrollTop - iframeBody.scrollTop));
}

function panView(deltaX, deltaY) {
    panViewAllowOverwrite(deltaX, deltaY, 0);
}

function getDeltaX() {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelZoom = frm.getAttribute('data-panelFitZoom');
    if (deviceW > deviceH && orientationLock != 'landscape' && !panelZoom) {
        var divScroll = document.getElementById('divScroll');
        return parseInt(divScroll.getAttribute('data-deltaX'));
    }
    else {
        return parseInt(frm.getAttribute('data-deltaX')); 
    }
}

function getDeltaY() {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelZoom = frm.getAttribute('data-panelFitZoom');
    if (deviceW > deviceH && orientationLock != 'landscape' && !panelZoom) {
        var divScroll = document.getElementById('divScroll');
        return parseInt(divScroll.getAttribute('data-deltaY'));
    }
    else {
        return parseInt(frm.getAttribute('data-deltaY'));
    }
}

function getScrollClientWidth(){
    var frm = document.getElementById(currentFrame.valueOf());
    var panelZoom = frm.getAttribute('data-panelFitZoom');
    if (deviceW > deviceH && orientationLock != 'landscape' && !panelZoom) {
        var divScroll = document.getElementById('divScroll');
        return (parseInt(divScroll.clientWidth));
    }
    else {
        var iframeBody= frm.contentDocument.body;
        return parseInt(iframeBody.clientWidth);
    }
}

function getScrollClientHeight() {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelZoom = frm.getAttribute('data-panelFitZoom');
    if (deviceW > deviceH && orientationLock != 'landscape' && !panelZoom) {
        var divScroll = document.getElementById('divScroll');
        return (parseInt(divScroll.clientHeight));
    }
    else {
        var iframeBody= frm.contentDocument.body;
        return parseInt(iframeBody.clientHeight);
    }

}

function clearFrameAttributes(frm) {
    frm.removeAttribute('data-panelFitZoom');
    frm.removeAttribute('data-panelLeft');
    frm.removeAttribute('data-panelTop');
    frm.removeAttribute('data-panelWidth');
    frm.removeAttribute('data-panelHeight');
    frm.removeAttribute('data-scrollWidth');
    frm.removeAttribute('data-scrollHeight');
    frm.removeAttribute('data-panelTargetId');
    frm.removeAttribute('data-panelType');
    frm.removeAttribute('data-originalWidth');
    frm.removeAttribute('data-originalHeight');
}

function gotoStandardView() {
    // get active frame.
    if ((deviceW < deviceH) || orientationLock == 'landscape') {
        var frm = document.getElementById(currentFrame.valueOf());
        clearFrameAttributes(frm);
        // fit loaded content to screen once more to switch back into standard view.
        fitLoadedContent(currentFrame, deviceW, deviceH);
    }
    else {
        // fit content in both frames and show both pages.
        var frames = document.getElementsByTagName('iframe');
        var i = 0;
        for (i = 0; i < frames.length; i++) {
            clearFrameAttributes(frames[i]);
        }
        var frame1 = findFrameForPage(parseInt(curBasePage));
        var frame2 = findFrameForPage(parseInt(curPairedPage));
        showAndPositionTwoPages(frame1, frame2, ltr, true);
    }
    
}

function getComputedWidth(obj) {
    return parseInt(obj.offsetWidth);
}

function getComputedHeight(obj) {
    return parseInt(obj.offsetHeight);
}

function centerPanel(frm, targetId, deviceWidth, deviceHeight) {
    var iframeDocument = frm.contentWindow.document;
    var targetEl = iframeDocument.getElementById(targetId);
    
    var targetNode = targetEl;
    var childNodes = targetEl.childNodes;
    for (i = 0; i < childNodes.length; i++) {
        var currentChild = childNodes[i];
        var cs = iframeDocument.defaultView.getComputedStyle(currentChild, null);
        if(cs != null) {
           var opacity = parseInt(cs.opacity);
           // find target node.
           var left = cs.left;
           var top = cs.top;
           var bottom = cs.bottom;
           var right = cs.right;
           if (left != 'auto' || top != 'auto' || bottom != 'auto' || right != 'auto') {
               targetNode = childNodes[i];
           }
        }
    }
    prepareBodyStyle(iframeDocument.body);
    iframeHtml = iframeDocument.getElementsByTagName('html')[0];
    iframeDocument.body.style.width='auto';
    iframeDocument.body.style.height='auto';

    var newWidth = getComputedWidth(targetNode);
    var newHeight = getComputedHeight(targetNode);
    var left = 0;
    var top = 0;

    deviceWidth = deviceWidth/iframeDocument.body.style.zoom;
    deviceHeight = deviceHeight/iframeDocument.body.style.zoom; 

    if (newWidth < deviceWidth) {
        left = Math.floor((deviceWidth - newWidth)/2);
    }
    if (newHeight < deviceHeight) {
        top = Math.floor((deviceHeight - newHeight)/2);
    }
    elementParent = targetNode.parentNode;
    while(elementParent != null && elementParent != iframeDocument.body) { 
        left -= parseInt(elementParent.offsetLeft);
        top  -= parseInt(elementParent.offsetTop); 
        elementParent = elementParent.parentNode;
    }
    targetNode.style.left = left + 'px';
    targetNode.style.top = top + 'px';
    targetNode.style.right='';
    targetNode.style.bottom='';
    frm.setAttribute('data-panelLeft', ((deviceW - (newWidth * iframeDocument.body.style.zoom))/2));
    frm.setAttribute('data-panelTop', ((deviceH - (newHeight * iframeDocument.body.style.zoom))/2));
    frm.setAttribute('data-panelWidth', newWidth * iframeDocument.body.style.zoom);
    frm.setAttribute('data-panelHeight', newHeight * iframeDocument.body.style.zoom);

    var zoomedWidth = parseFloat (newWidth * iframeDocument.body.style.zoom);
    var zoomedLeft = parseFloat(left * iframeDocument.body.style.zoom);
    var zoomedHeight = parseFloat(newHeight * iframeDocument.body.style.zoom);
    var zoomedTop = parseFloat(top * iframeDocument.body.style.zoom);
   
    var maxScrollWidth = parseInt(zoomedLeft + zoomedWidth - deviceW) ;
    var maxScrollHeight = parseInt(zoomedTop + zoomedHeight - deviceH);

    frm.setAttribute('data-scrollWidth', maxScrollWidth);
    frm.setAttribute('data-scrollHeight', maxScrollHeight);
 
}

function getPanelTop() {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelTop = frm.getAttribute('data-panelTop'); 
    if(panelTop) {
        if (frm.getAttribute('data-panelFitZoom') == frm.contentDocument.body.style.zoom) {
            return parseInt(panelTop);
        }
        else {
            return parseInt(panelTop - frm.contentDocument.body.scrollTop);
        }
    }
    return 0;
}

function getPanelLeft() {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelLeft = frm.getAttribute('data-panelLeft'); 
    if(panelLeft) {
        if (frm.getAttribute('data-panelFitZoom') == frm.contentDocument.body.style.zoom) {
            return parseInt(panelLeft);
        }
        else {
            return parseInt(panelLeft - frm.contentDocument.body.scrollLeft);
        }
    }
    return 0;
}

function getPanelWidth() {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelWidth = frm.getAttribute('data-panelWidth'); 
    if(panelWidth) {
        return parseInt(panelWidth);
    }
    return -1;
}

function getPanelHeight() {
    var frm = document.getElementById(currentFrame.valueOf());
    var panelHeight = frm.getAttribute('data-panelHeight'); 
    if(panelHeight) {
        return parseInt(panelHeight);
    }
    return -1;
}

function restoreTextSize(pageNumber) {
    var frm = findFrameForPage(pageNumber);
    if (frm == null) {
        return;
    }
    var iframeDocument = frm.contentDocument;
    iframeDocument.body.style.zoom = parseFloat(frm.getAttribute('data-fitZoom'));
}

function scaleTextSize(pageNumber, targetId) {
    var frm = findFrameForPage(pageNumber);
    currentFrame = frm.id;
    if (frm == null) {
        return;
    }
    var iframeDocument = frm.contentDocument;
    prepareBodyStyle(iframeDocument.body);
    var targetNode = iframeDocument.getElementById(targetId.valueOf());
    var fontSize = iframeDocument.defaultView.getComputedStyle(targetNode, null).getPropertyValue('font-size');
    var zoomFactor = parseInt(READABLE_FONT_SIZE)/parseInt(fontSize);
    iframeDocument.body.style.zoom = iframeDocument.body.style.zoom * zoomFactor;
    frm.setAttribute('data-panelFitZoom', iframeDocument.body.style.zoom);
    iframeDocument.body.scrollTop = targetNode.offsetTop * zoomFactor;
    iframeDocument.body.scrollLeft = targetNode.offsetLeft * zoomFactor;
    frm.setAttribute('data-panelLeft', iframeDocument.body.scrollLeft);
    frm.setAttribute('data-panelTop', iframeDocument.body.scrollTop);
    frm.setAttribute('data-panelWidth', targetNode.offsetWidth * zoomFactor);
    frm.setAttribute('data-panelHeight', targetNode.offsetHeight * zoomFactor);
    frm.setAttribute('data-panelType', CHILDREN);
    alignContent(frm, frm.getAttribute('data-originalWidth'), frm.getAttribute('data-originalHeight'), deviceW, deviceH, CENTER);
    
}

function currentDocString() {
    return (document.getElementById(currentFrame.valueOf()).contentDocument.body.innerHTML); 
}

function fitPanelToScreen(pageNumber, targetId, deviceWidth, deviceHeight) {
    
    var frm = findFrameForPage(pageNumber);
    currentFrame = frm.id;
    if (frm == null) {
        return;
    }
    makeFullPage(frm, true);
    var iframeDocument = frm.contentWindow.document;
    var targetEl = iframeDocument.getElementById(targetId);
    var targetNode = targetEl;
    var childNodes = targetEl.childNodes;
    for (i = 0; i < childNodes.length; i++) {
        var currentChild = childNodes[i];
        var cs = iframeDocument.defaultView.getComputedStyle(currentChild, null);
        if(cs != null) {
           var opacity = parseInt(cs.opacity);
           // turn off opacity.
           if (opacity != 1 ){
               currentChild.style.opacity = 1;
               currentChild.style.backgroundColor = '#fff';
           }
           // find target node.
           var left = cs.left;
           var top = cs.top;
           var bottom = cs.bottom;
           var right = cs.right;
           if (left != 'auto' || top != 'auto' || right != 'auto' || bottom != 'auto') {
               targetNode = childNodes[i];
           }
        }
    }
    // remove margin settings on body before centering panel.
    prepareBodyStyle(iframeDocument.body);
    iframeDocument.body.style.zoom = '1.0';

    iframeHtml = iframeDocument.getElementsByTagName('html')[0];
    iframeHtml.style.overflow = 'hidden';
    iframeDocument.body.style.width='auto';
    iframeDocument.body.style.height='auto';

    // fit target node to screen
    var panelWidth = getComputedWidth(targetNode);
    var panelHeight = getComputedHeight(targetNode);

    var wratio = deviceWidth/panelWidth;
    var hratio = deviceHeight/panelHeight;
    var zoom = Math.min(wratio, hratio);
    targetNode.setAttribute('data-panelFitZoom', parseFloat(zoom));
    frm.setAttribute('data-panelFitZoom', parseFloat(zoom));
    frm.setAttribute('data-panelTargetId', targetId);
    frm.setAttribute('data-panelType', COMIC);
    console.log('new zoom is ' + parseFloat(zoom));
    iframeDocument.body.style.zoom = zoom;

    centerPanel(frm, targetId, deviceWidth, deviceHeight);

}

function hasAllFramesLoaded() {
    var frames = document.getElementsByTagName('iframe');
    var i = 0, framesInUse = 0;
    for (i = 0; i < frames.length; i++) {
        var pageLoadStatus = frames[i].getAttribute('data-pageLoadStatus');
        if(pageLoadStatus) {
            if(pageLoadStatus == LOADING) return 0;
            framesInUse++;
        }
    }
    return (framesInUse > 0)? 1 : 0;
}

function templateLoaded() {
    var i = 0;
    var frames = document.getElementsByTagName('iframe');
    for (i = 0; i < frames.length; i++) {
        frames[i].addEventListener("load", loaded, false);
        frames[i].setAttribute('data-frameStatus', 'hidden');
        frames[i].setAttribute('page', INVALID_PAGE_VALUE);
    }

}
window.addEventListener("load", templateLoaded, false);
