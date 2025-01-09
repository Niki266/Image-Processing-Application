/* Commentry: -
Findings -
The segmentation results for each channel are different because each channel represents different color information in the image. When segmenting each channel separately, specific color ranges are isolated based on the threshold applied to that particular channel. As a result, the segmentation result for each channel may vary depending on the distribution of colors in that channel. My threshold is in black and white to separate color from brightness making it easier to segment objects based on their color, rather than their lighting.

Comparing the segmentation results from step 7 to those obtained by segmenting each channel separately, differences may be observed in noise levels and segmentation accuracy. Segmenting each channel separately might lead to noisier segmentation due to variations in color distributions across channels. Utilizing a different color space, such as HSV, could potentially improve segmentation results by better representing color properties, especially in handling complex color distributions, varying lighting conditions and color-intensity seperation.

Extensions -
I had implemented two extensions -
Posterize filter - The filter works by reducing the number of colors in an image to a specified level. It loops through each pixel of the image, calculates the average of the RGB values, and determines which color group the pixel falls into based on this average. This determines the level of posterization. In this implementation, the colors is reduced to five and are chosen through a color picker.

The uniqueness of the posterize filter compared to other filters lies in its ability to simplify the color palette of an image, creating a stylized and artistic effect. It directly alters the color distribution, making it stand out as a distinct tool in image processing.

Implementing this filter, involves challenges in determining the appropriate color groups and mapping pixel colors to those groups effectively. Additionally, ensuring smooth transitions between color groups without losing image detail requires careful handling. This implementation tackles these challenges by calculating color averages and mapping pixels to the appropriate color group based on those averages, providing a simplified yet visually appealing result.

Emoji filter - I made an extra big slide of the live webcam and applied various emojis on the user’s face. Users can press the left and right arrow keys to choose different emojis. This filter adds a fun and engaging aspect to the application and enhances user experience since users know about emojis and their meanings providing a unique way to interact with detected faces.

Problems faced -
One problem was implementing a cartoon filter by blurring the face till it looked animated or using a fast neural style transfer model which resulted in a very messy and sluggish output. Instead, I made the posterize and Emoji filter which gave the same fun, creative and engaging effect that I wanted to give using the cartoon filter. 

On target to successfully complete project -
Despite initial challenges, I was on target to successfully complete the project achieving its intended objectives.*/

let ImgArray = [];
let clickPic; //Function to hold snapshot

let webcam;
let taskInProgress = false;//Flag to track whether a task is in progress or not
let selectedKeyStroke = "1";
let faceApiLoaded = false;
const detectionOptions = {
  withLandmarks: true,
  withDescriptors: false,
};

let faceApi;
let Results = [];
let isFace = false; //by default
let faceGrey;
let faceBlur;
let facePixel;
let faceCmy;
let faceMoji;
let posterize;
let posterCols = [];

//any number of emojis can be added
let emojiStr = ["😮‍💨", "😂", "😁", "😇", "🥹", "😅", "🥲", "😘"];
let currentMoji = 0;// Index for the current emoji
let faceDetectionHasStarted = false;

function setup() {
  createCanvas(1440, 850);
  pixelDensity(2);
  webcam = createCapture(VIDEO).hide();//Incorporated into an html video tag with Creating a webcam capture element and hiding it
  faceApi = ml5.faceApi(detectionOptions, modelLoaded);// loaded the face API model from ml5 API, Initializing the face API

  //In grid I have 15 ImgArray and I start them all here making 15 blank ImgArray in
  //array, I'll later update each one of them separately
  //here on the top left I place the video (I resized it in draw, because its asynchronous)
  for (let i = 0; i < 15; i++) {
    if (i == 2) {
      ImgArray.push(webcam);// Pushing the webcam feed into ImgArray at index 2
    } else {
      ImgArray.push(createImage(160, 120));
    }
  }
  faceMoji = createImage(160, 120);// Creating an image element for face with emoji
  
  //posterize extension - creating image and color picker
  posterize = createImage(160, 120);//The function initializes a new image (posterize) to the current webcam feed.
  posterCols[0] = createColorPicker("#090E22")
    .size(40, 40)
    .position(880, 730)
    .changed(() => {
      updatePosterize();//This function implements the posterize filter
    });
  posterCols[1] = createColorPicker("#420518")
    .size(40, 40)
    .position(930, 730)
    .changed(() => {
      updatePosterize();
    });
  posterCols[2] = createColorPicker("#5A0818")
    .size(40, 40)
    .position(980, 730)
    .changed(() => {
      updatePosterize();
    });
  posterCols[3] = createColorPicker("#DE9E24")
    .size(40, 40)
    .position(1030, 730)
    .changed(() => {
      updatePosterize();
    });
  posterCols[4] = createColorPicker("#ffffff")
    .size(40, 40)
    .position(1080, 730)
    .changed(() => {
      updatePosterize();
    });
  updatePosterize();

  imageMode(CENTER);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(15);
  //Extension to my code is another image(live from camera all the times)
  //with a snap button this button takes an image from your webcam and performs every
  //task and it can be updated by clicking again.
  takeSnap = createButton("click").size(90, 25);//“click” and spacebar pressing function ran all the functions for this assignment one by one
  takeSnap.position(605, 130);
  takeSnap.mouseClicked(
    (clickPic = () => {
      //reset detais from before
      // Results = [];
      faceGrey = undefined;
      facePixel = undefined;
      faceCmy = undefined;

      if (faceApiLoaded == false) {
        //do not run tasks if the face API is not loaded
        return;
      }
      //Here I want the ImgArray to be processed one by one
      //catch the face in the image and get the details of the face from ml5 API
      if (!faceDetectionHasStarted) {
        faceDetectionHasStarted = true;
        faceApi.detect(webcam.get(), searchFace);
      }

      //Here the task is an array of functions that happens to execute every function in it  on
      //intervals of 10 frames until no task is left
      //saving a pic in memory
      ImgArray[0] = webcam.get();

      //making the greyscale and 20% brighter and ensuring no pixel can have a value of more than 255
      ImgArray[1] = greyScaleWithBright(ImgArray[0].get());

      //In these positions of the grid I applied the channel filter by changing the input image's 2 or three values to 0, iteratively
      ImgArray[3] = redOnly(ImgArray[0].get());
      ImgArray[4] = greenOnly(ImgArray[0].get());
      ImgArray[5] = blueOnly(ImgArray[0].get());
      ImgArray[6] = applyRedSeg(ImgArray[3].get());
      ImgArray[7] = applyGreenSeg(ImgArray[4].get());

      ImgArray[8] = applyBlueSeg(ImgArray[5].get());

      ImgArray[9] = ImgArray[0].get();//Saving another snapshot of the webcam feed

      ImgArray[10] = HSVcolorSpace(ImgArray[9].get());

      ImgArray[13] = segmentation(ImgArray[10].get(), hsvSlider.value());

      ImgArray[11] = CMYcolorSpace(ImgArray[9].get());

      ImgArray[14] = segmentation(ImgArray[11].get(), cmySlider.value());
      //this function implements the posterize filter
      updatePosterize();
    })
  );

  //channel segmentation and creating sliders
  redChannel = createSlider(0, 255, 200, 1)
    .changed(() => {
      ImgArray[6] = applyRedSeg(ImgArray[0].get());
    })
    .size(160, 20);
  redChannel.position(65, 470);

  greenChannel = createSlider(0, 255, 200, 1)
    .changed(() => {
      ImgArray[7] = applyGreenSeg(ImgArray[0].get());
    })
    .size(160, 20);
  greenChannel.position(315, 470);

  blueChannel = createSlider(0, 255, 200, 1)
    .changed(() => {
      ImgArray[8] = applyBlueSeg(ImgArray[0].get());
    })
    .size(160, 20);
  blueChannel.position(570, 470);

  hsvSlider = createSlider(0, 255, 100, 1)
    .size(160, 20)
    .changed(() => {
      ImgArray[13] = segmentation(ImgArray[10].get(), hsvSlider.value());
    });
  hsvSlider.position(315, 780);

  cmySlider = createSlider(0, 255, 100, 1)
    .size(160, 20)
    .changed(() => {
      ImgArray[14] = segmentation(ImgArray[11].get(), cmySlider.value());
    });
  cmySlider.position(570, 780);
}
let tags = [
  "Webcam Image",
  "Grayscale and brightness + 20%",
  "Camera - 'Click' or press Space",
  "Red Channel",
  "Green Channel",
  "Blue Channel",
  "Red Channel Threshold",
  "Green Channel Threshold",
  "Blue Channel Threshold",
  "Webcam image(repeat)",
  "HSV",
  "CMY(K)",
  "Face Detection - Press Keys",
  "HSV Threshold",
  "CMY(K) Threshold",
];

function draw() {
  background(80);
  rect(width / 2, height / 2, width, height);
  //resize webcam to needed size
  if (webcam.width != 160) {
    webcam.size(160, 120);
    //start searching face;
  }
  for (let i = 0; i < 15; i++) {
    let y = map(int(i / 3), 0, 4, 100, 700);
    let x = map(i % 3, 0, 2, 150, 650);
    rect(x, y, 160, 120);
    fill(0);
    image(ImgArray[i], x, y);
    text(tags[i], x, y + 70);
    noFill();
  }
  //selected keystroke draw
  for (let i = 1; i <= 5; i++) {
    let x = 60 + map(i, 1, 4, 20, 120);
    let y = 795;
    if (i == selectedKeyStroke) {
      fill("red");
    } else {
      fill(255);
    }
    circle(x, y, 30);
    fill(0);
    text(i, x, y);
    noFill();
  }
  //Displaying a message if no face is detected
  if (Results.length != 1) {
    textSize(12);
    fill(255);
    text("No Face Detected,try again", 150, 700);
    textSize(16);
  }
  noFill();

  if (Results.length == 1) {
    stroke("yellow");
    let yellowBox = Results[0].alignedRect.relativeBox;
    let w = map(yellowBox.width, 0, 1, 0, 160);
    let h = map(yellowBox.height, 0, 1, 0, 120);
    let x = map(yellowBox.x, 0, 1, 0, 160);
    let y = map(yellowBox.y, 0, 1, 0, 120);

	//Face detection filters
    switch (selectedKeyStroke) {//These five tasks are interchangeable by pressing keys from 1-5
      case "1"://A yellow rectangle around the face 
        rect(70 + x + w / 2, 640 + y + h / 2, w, h);
        break;
      case "2"://Grayscale face 
        if (!faceGrey) {
          faceGrey = greyScaleWithBright(webcam.get()).get(x, y, w, h);
        } else {
          image(faceGrey, 70 + x + w / 2, 640 + y + h / 2);
        }
        break;
      case "3"://Blurred face 
        if (!faceBlur) {
          faceBlur = webcam.get(x, y, w, h);
          faceBlur.filter(BLUR, 3);
        } else {
          image(faceBlur, 70 + x + w / 2, 640 + y + h / 2);
        }
        break;

      case "4"://Pixelated face(used a pixelating nested-loop in function)
        if (!facePixel) {
          facePixel = pixelationOnFace(webcam.get(x, y, w, h));
        } else {
          image(facePixel, 70 + x + w / 2, 640 + y + h / 2, w, h);
        }
        break;
      case "5"://CMY color space on face
        if (!faceCmy) {
          faceCmy = CMYcolorSpace(webcam.get()).get(x, y, w, h);
        } else {
          image(faceCmy, 70 + x + w / 2, 640 + y + h / 2);
        }
        break;
      default:
        break;
    }
  }
  stroke(0);
  push();
  rect(1000, 200, 320, 240);
  rect(1000, 600, 320, 240);
  image(faceMoji, 1000, 200, 320, 240);
  //Checking if a face is detected and displaying emoji over the face
  image(posterize, 1000, 600, 320, 240);

  if (Results.length > 0) {
    let emojiOverFace = Results[0].alignedRect.relativeBox;
    let w = map(emojiOverFace.width, 0, 1, 0, 320);
    let h = map(emojiOverFace.height, 0, 1, 0, 240);
    let x = map(emojiOverFace.x, 0, 1, 0, 320);
    let y = map(emojiOverFace.y, 0, 1, 0, 240);

    x = 840 + x + w / 2;
    y = 80 + y + h / 2;
    push();
    textSize(80);
    text(emojiStr[currentMoji], x, y);
    pop();
	// Changing the current emoji based on the arrow key input
    if (keyIsPressed) {
      keyIsPressed = false;
      if (key == "ArrowLeft") {
        if (currentMoji > 0) {
          currentMoji -= 1;
        } else {
          currentMoji = emojiStr.length - 1;
        }
      } else if (key == "ArrowRight") {
        if (currentMoji < emojiStr.length - 1) {
          currentMoji += 1;
        } else {
          currentMoji = 0;
        }
      }
    }
  }
  circle(950, 350, 40);
  circle(1050, 350, 40);
  fill(0);
  //Extensions
  text("Use left-right arrow keys for emojis!", 1000, 60);
  text("Posterization effect - change color to customize", 1000, 460);
  text("<-", 950, 350);
  text("->", 1050, 350);
  pop();
}

// Function to apply greyscale and brightness adjustment to an image
function greyScaleWithBright(img, bright = 20) {
  img.loadPixels();
  let index, r, g, b;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      r = img.pixels[index];
      g = img.pixels[index + 1];
      b = img.pixels[index + 2];
      greyScale = (r + g + b) / 3;
      greyScale = greyScale + greyScale * (bright / 100); //20% bright
      if (greyScale > 255) {
        greyScale = 255;
      }
      img.pixels[index] = greyScale;
      img.pixels[index + 1] = greyScale;
      img.pixels[index + 2] = greyScale;
    }
  }
  img.updatePixels();
  return img;
}

// Function to filter out only the red channel from an image
function redOnly(img) {
  img.loadPixels();
  let index;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      img.pixels[index + 1] = 0;
      img.pixels[index + 2] = 0;
    }
  }
  img.updatePixels();
  return img;
}

// Function to filter out only the green channel from an image
function greenOnly(img) {
  img.loadPixels();
  let index;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      img.pixels[index] = 0;
      img.pixels[index + 2] = 0;
    }
  }
  img.updatePixels();
  return img;
}

// Function to filter out only the blue channel from an image
function blueOnly(img) {
  img.loadPixels();
  let index;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      img.pixels[index] = 0;
      img.pixels[index + 1] = 0;
    }
  }
  img.updatePixels();
  return img;
}

// Function to apply red channel segmentation to an image based on a threshold value
function applyRedSeg(img) {
  img.loadPixels();
  let index;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      if (img.pixels[index] < redChannel.value()) {
        img.pixels[index] = 0;
        img.pixels[index + 1] = 0;
        img.pixels[index + 2] = 0;
      } else {
        img.pixels[index] = 255;
        img.pixels[index + 1] = 255;
        img.pixels[index + 2] = 255;
      }
    }
  }
  img.updatePixels();
  return img;
}

// Function to apply green channel segmentation to an image based on a threshold value
function applyGreenSeg(img) {
  img.loadPixels();
  let index;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      if (img.pixels[index + 1] < greenChannel.value()) {
        img.pixels[index + 1] = 0;
        img.pixels[index + 0] = 0;
        img.pixels[index + 2] = 0;
      } else {
        img.pixels[index + 1] = 255;
        img.pixels[index + 0] = 255;
        img.pixels[index + 2] = 255;
      }
    }
  }
  img.updatePixels();
  return img;
}

// Function to apply blue channel segmentation to an image based on a threshold value
function applyBlueSeg(img) {
  img.loadPixels();
  let index;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      if (img.pixels[index + 2] < blueChannel.value()) {
        img.pixels[index + 2] = 0;
        img.pixels[index + 0] = 0;
        img.pixels[index + 1] = 0;
      } else {
        img.pixels[index + 2] = 255;
        img.pixels[index + 0] = 255;
        img.pixels[index + 1] = 255;
      }
    }
  }
  img.updatePixels();
  return img;
}

// Function to convert an image to HSV color space
function HSVcolorSpace(img) {
  img.loadPixels();
  let index, r, g, b, Min, Max, R, G, B, s, v, h;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      //normalise r,g,b to 0-1
      r = map(img.pixels[index], 0, 255, 0, 1);
      g = map(img.pixels[index + 1], 0, 255, 0, 1);
      b = map(img.pixels[index + 2], 0, 255, 0, 1);
      Max = max([r, g, b]);
      Min = min([r, g, b]);

      R = (Max - r) / (Max - Min);
      G = (Max - g) / (Max - Min);
      B = (Max - b) / (Max - Min);

      s = (Max - Min) / Max;
      v = Max;
      // console.log(s);
      if (s == 0) {
        //mono chrome
        let avg = (r + g + b) / 3;
        img.pixels[index] = map(avg, 0, 1, 0, 255);
        img.pixels[index + 1] = map(avg, 0, 1, 0, 255);
        img.pixels[index + 2] = map(avg, 0, 1, 0, 255);
      } else {
        if (r == Max && g == Min) {
          h = 5 + B;
        } else if (r == Max && g != Min) {
          h = 1 - G;
        } else if (g == Max && b == Min) {
          h = R + 1;
        } else if (g == Max && b != Min) {
          h = 3 - B;
        } else if (r == Max) {
          h = 3 + G;
        } else {
          h = 5 - R;
        }

        img.pixels[index] = map(h, 0, 1, 0, 255);
        img.pixels[index + 1] = map(s, 0, 1, 0, 255);
        img.pixels[index + 2] = map(v, 0, 1, 0, 255);
      }
    }
  }
  img.updatePixels();
  return img;
}

//Function to convert an image to CMY color space
function CMYcolorSpace(img) {
  img.loadPixels();
  let index, r, g, b;
  let c, m, y, A;
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      let c = 1;

      img.pixels[index] = 255 - img.pixels[index] * c;
      img.pixels[index + 1] = 255 - img.pixels[index + 1] * c;
      img.pixels[index + 2] = 255 - img.pixels[index + 2] * c;
    }
  }
  img.updatePixels();
  return img;
}

// Function to perform segmentation on an image based on a threshold value
function segmentation(img, value) {
  img.loadPixels();
  for (let x = 0; x < img.width; x++) {
    for (let y = 0; y < img.height; y++) {
      index = (x + y * img.width) * 4;
      if (
        (img.pixels[index] + img.pixels[index + 1] + img.pixels[index + 2]) /
          3 <
        value
      ) {
        img.pixels[index] = 0;
        img.pixels[index + 1] = 0;
        img.pixels[index + 2] = 0;
      } else {
        img.pixels[index] = 255;
        img.pixels[index + 1] = 255;
        img.pixels[index + 2] = 255;
      }
    }
  }
  img.updatePixels();
  return img;
}

// Function to handle keyboard input events
function keyPressed() {
  if (int(key) >= 1 && int(key) <= 5) {
    selectedKeyStroke = key;
  }
  if (key == " ") {
    clickPic();
  }
}

// Function to handle the loading of the face detection model
function modelLoaded() {
  console.log("Face Api Loaded");
  faceApiLoaded = true;
}

//Function to search the face in face detection
function searchFace(err, results) {
  faceMoji = webcam.get();
  if (results.length != 1) {
    console.log("face not detected or more than one face detected, try again");
    isFace = true;
  } else {
    isFace = false;
    Results = results;
    ImgArray[12] = webcam.get();
    faceGrey = undefined;
    faceBlur = undefined;
    facePixel = undefined;
    faceCmy = undefined;
  }
  faceApi.detect(webcam.get(), searchFace);
}

// Function to apply pixelation effect to an image
function pixelationOnFace(img) {
  //convert the whole thing to 5x5 pixel blocks
  let row = floor(img.height / 5);
  let col = floor(img.width / 5);
  img.resize(5 * col, 5 * row);

  img.loadPixels();
  //first nested loop of a and b for the blocks of 5x5
  for (let a = 0; a < col; a++) {
    for (let b = 0; b < row; b++) {
      let x = a * 5;
      let y = b * 5;
      let avg = [0, 0, 0, 255];
      //nested loops of ixj is for each pixel in 1 block
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          let pixel = img.get(x + 1, y + j);
          avg[0] += pixel[0] / 25;
          avg[1] += pixel[1] / 25;
          avg[2] += pixel[2] / 25;
        }
      }
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          img.set(x + i, y + j, avg);
        }
      }
    }
  }

  img.updatePixels();
  return img;
}

//Function to update posterize effect to an image
function updatePosterize() {
  posterize = webcam.get();
  let col, avg;
  posterize.loadPixels();
  for (let x = 0; x < posterize.width; x++) {
    for (let y = 0; y < posterize.height; y++) {
      col = posterize.get(x, y);
      avg = (col[0] + col[1] + col[2]) / 3;
      avgIndex = floor((avg / 256) * 5);//the number of colors is reduced to five
      // console.log(avgIndex);
      posterize.set(x, y, color(posterCols[avgIndex].value()));
    }
  }
  posterize.updatePixels();
}
