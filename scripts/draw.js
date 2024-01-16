/**
 * Event listners
 */
document.addEventListener("DOMContentLoaded", retrieveFonts);

/**
 * This function sets the google font to be used by the image
 * configurator.
 * 
 * @param {*} event The event object triggered by the user when
 * selecting a new font from the list of available fonts.
 */
function useFont(){
    
    const font = document.getElementById("font");
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css?family=${font.value}&display=block`;
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return link.href;
}

/**
 * This function loads in all the fonts required by the image
 * configurator.
 * 
 * @param {*} event The event object passed by the event listener
 * when all the DOM content is loaded.
 */
async function retrieveFonts(event){

    const fontList = document.getElementById("font");

    // Hide page while loading
    document.body.style.display = "none";
    
    // This block retrievs all the google fonts and adds them as 
    // fonts available to the configurator.
    const xhttp = new XMLHttpRequest();

    xhttp.onload = function(){
        const jsonData = JSON.parse(this.responseText)["items"];
        
        // The loop adds each option
        for(i in jsonData){
            fontList.innerHTML += 
            `
            <option value="${jsonData[i].family}">${jsonData[i].family}</option>
            `
        }

        // Display the page once the page is finished loading
        document.body.style.display = "flex";
    };

    xhttp.open("GET","https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAmj41u9TC_on8VFIsj6hpPa-myxYKXxJ4");
    xhttp.send();
}

/**
 * This method adds a new colour picker to the software configurator.
 */
function addCP(){

    const colourPickers = document.getElementById("colour-pickers");
    const newColourPicker = document.createElement("input",);
    newColourPicker.setAttribute("class", "color");
    newColourPicker.setAttribute("type", "color");
    colourPickers.appendChild(newColourPicker); 
               
}

/**
 * This method downloads the image held by the specified canvas element.
 * 
 * @param {*} canvas The canvas element from which an image should be
 * downloaded.
 * 
 * @param {number} number The unique identifier of the image being 
 * downloaded.
 */
function downloadCanvasImage(canvas, number){

    const a = document.createElement("a");
    a.download = number+".png";
    document.body.appendChild(a);
    canvas.toBlob(function(blob){
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.click();
    })
    document.body.removeChild(a);
}


/**
 * This method is utilized to create an invisible temporary, canvas 
 * and a new image upon it.
 * 
 * @param {string} text This variable holds the text from which the
 * canvas element should generated an image.
 * 
 * @param {number} num This variable holds the unique identifier of 
 * the image to be created.
 */
async function createInvisibleCanvas(text, num){

    const url = useFont();

    // Retrieve woff url
    let response = await fetch(url);
    response = await response.text();
    const woffArray = Array.from(response.matchAll(/url\(.*\)/g));

    // Canvas Elements
    const imageCreator = document.createElement("canvas");
    imageCreator.width = 6000;
    imageCreator.height = 8000;
    imageCreator.style = "width: 6000px; height: 8000px; display: none";
    document.body.appendChild(imageCreator);

    // Input Elements
    const fontSizeElement = document.getElementById("fontSize");
    const fontElement = document.getElementById("font");
    const marginWidthElement = document.getElementById("marginWidth");
    const marginTopElement = document.getElementById("marginTop");
    const spacingElement = document.getElementById("spacing");

    // Get Data From Fields
    const fontSize = fontSizeElement.value;
    const font = fontElement.value;
    const marginWidth = marginWidthElement.value;
    const marginTop = marginTopElement.value;
    const spacing = spacingElement.value;

    // Scaling Factor
    const scale = 10;

    // Canvas Context
    const imageCreatorContext = imageCreator.getContext("2d");
    
    // Temporary Calculation Variables
    let width = 0;
    let height = 0
    let leftOffset = 0;
    
    // Temporary Centering Varables
    let line = "";
    let words = text.split(" ");
    let rowNum = 0;

    // Load font
    for(let i=0; i<woffArray.length; i++){
        const loader = new FontFace(font, woffArray[i]);
        await loader.load();
        document.fonts.add(loader);
        document.body.classList.add("fonts-loaded");
    }

    // Set Canvas Properties
    imageCreatorContext.width = 6000;
    imageCreatorContext.height = 8000;
    imageCreatorContext.scale(scale, scale); 
    imageCreatorContext.font = fontSize + "px " + font;
    height = Math.round(imageCreatorContext.measureText("O")["width"]) + 15 + parseInt(spacing);


    // This block generates a linear gradient for the text.           
    const xStart = parseInt(marginWidth)/2;
    const gradientVisible = imageCreatorContext.createLinearGradient(xStart, 0, 600 - xStart, 0);
    const colourPickers = document.getElementById("colour-pickers");
    const colours = colourPickers.childNodes;
    
    // This conditional block creates a custom gradient from the selected colors.
    if(colours.length > 1){
        for(let i=0; i<colours.length; i++){
            if(colours[i].nodeName.toLowerCase() == "input" && colours[i].type.toLowerCase() == "color"){
                gradientVisible.addColorStop(i/(colours.length-1), colours[i].value);
            }
        }
    }else{
        for(let i=0; i<colours.length; i++){
            if(colours[i].nodeName.toLowerCase() == "input" && colours[i].type.toLowerCase() == "color"){
                gradientVisible.addColorStop(0, colours[i].value);
                gradientVisible.addColorStop(1, colours[i].value);
            }
        }
    }

    imageCreatorContext.fillStyle = gradientVisible;
    
    // This block generates the image text according to the specified format
    for(let i=0; i < words.length; i++){
        if(imageCreatorContext.measureText(line + words[i])["width"] > 600 - parseInt(marginWidth)){
            width = imageCreatorContext.measureText(line)["width"]
            leftOffset = Math.round((imageCreatorContext.width/scale - width)/2);
            imageCreatorContext.fillText(line,leftOffset,50 + parseInt(marginTop) + rowNum*height);
            rowNum++;
            if(i+1 == words.length){
                line = words[i];
            }else{
                line = words[i] + " ";
            }
        }else{
            if(i+1 == words.length){
                line += words[i];
            }else{
                line += words[i] + " ";
            }
        }
    }

    if(line.length > 0){
        width = imageCreatorContext.measureText(line)["width"]
        leftOffset = Math.round((imageCreatorContext.width/scale - width)/2);
        imageCreatorContext.fillText(line,leftOffset,50 + parseInt(marginTop) + rowNum*height);
    }

    // The download method is called after the image is created and then the 
    // temporary is deleted.
    downloadCanvasImage(imageCreator, num);
    document.body.removeChild(imageCreator);
}


/**
 * This method generates a series of images based upon an input list of
 * quotes as provided by the user via a file.
 */
function createImages(){
    
    // The file is retrieved
    const file = document.getElementById("fileInput").files[0];
    const reader = new FileReader();
    
    // The file is read and split into lines
    reader.addEventListener("load", () => {
        const content = reader.result;
        const quotes = content.split("\n");
        
        // Each line is used to create a seperate image.
        for(let i=0; i < quotes.length; i++){

            createInvisibleCanvas(quotes[i], i);

        }

    }, false);

    if(file){
        reader.readAsText(file);
    }
}



/**
 * This method creates the preview canvas in order that an image template
 * may be created prior to the automatic templatised generation of images.
 */
async function createVisibleCanvas(){

    const url = useFont();

    // Retrieve woff url
    let response = await fetch(url);
    response = await response.text();
    const woffArray = Array.from(response.matchAll(/url\(.*\)/g));

    // Canvas Elements
    const showPreview = document.getElementById("showPreview");

    // Input Elements
    const exampleElement = document.getElementById("exampleText");
    const fontSizeElement = document.getElementById("fontSize");
    const fontElement = document.getElementById("font");
    const marginWidthElement = document.getElementById("marginWidth");
    const marginTopElement = document.getElementById("marginTop");
    const spacingElement = document.getElementById("spacing");

    // Get Data From Fields
    const text = exampleElement.value;
    const fontSize = fontSizeElement.value;
    const font = fontElement.value;
    const marginWidth = marginWidthElement.value;
    const marginTop = marginTopElement.value;
    const spacing = spacingElement.value;

    // Canvas Context
    const showPreviewContext = showPreview.getContext("2d");
    
    // Temporary Calculation Variables
    let width = 0;
    let height = 0
    let leftOffset = 0;
    
    // Temporary Centering Varables
    let line = "";
    let words = text.split(" ");
    let rowNum = 0;

    // Load font
    for(let i=0; i<woffArray.length; i++){
        const loader = new FontFace(font, woffArray[i]);
        await loader.load();
        document.fonts.add(loader);
        document.body.classList.add("fonts-loaded");
    }


    // Set Canvas Properties
    showPreviewContext.width = 600;
    showPreviewContext.height = 800;
    showPreviewContext.font = fontSize + "px " + font;
    height = Math.round(showPreviewContext.measureText("O")["width"]) + 15 + parseInt(spacing);
    showPreviewContext.clearRect(0,0,showPreviewContext.width, showPreviewContext.height);


    const xStart = parseInt(marginWidth)/2;
    const gradientVisible = showPreviewContext.createLinearGradient(xStart, 0, showPreviewContext.width - xStart, 0);
    const colourPickers = document.getElementById("colour-pickers");
    const colours = colourPickers.childNodes;
    
    // This conditional block creates a custom gradient from the selected colors.
    if(colours.length > 1){
        for(let i=0; i<colours.length; i++){
            if(colours[i].nodeName.toLowerCase() == "input" && colours[i].type.toLowerCase() == "color"){
                gradientVisible.addColorStop(i/(colours.length-1), colours[i].value);
            }
        }
    }else{
        for(let i=0; i<colours.length; i++){
            if(colours[i].nodeName.toLowerCase() == "input" && colours[i].type.toLowerCase() == "color"){
                gradientVisible.addColorStop(0, colours[i].value);
                gradientVisible.addColorStop(1, colours[i].value);
            }
        }
    }

    showPreviewContext.fillStyle = gradientVisible;

    // This block generates the image text according to the specified format
    for(let i=0; i < words.length; i++){
        if(showPreviewContext.measureText(line + words[i])["width"] > 600 - parseInt(marginWidth)){
            width = showPreviewContext.measureText(line)["width"]
            leftOffset = Math.round((showPreviewContext.width - width)/2);
            showPreviewContext.fillText(line,leftOffset,50 + parseInt(marginTop) + rowNum*height);
            console
            rowNum++;
            if(i+1 == words.length){
                line = words[i];
            }else{
                line = words[i] + " ";
            }
        }else{
            if(i+1 == words.length){
                line += words[i];
            }else{
                line += words[i] + " ";
            }
        }
    }

    if(line.length > 0){
        width = showPreviewContext.measureText(line)["width"]
        leftOffset = Math.round((showPreviewContext.width - width)/2);
        showPreviewContext.fillText(line,leftOffset,50 + parseInt(marginTop) + rowNum*height);
    }
}