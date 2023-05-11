let video;
let posenet;

let singlePose, skeleton;
let state = "collecting";

let video_variables = {};
let brain;

let poseLabel = "rounded_back";

function preload() {
  console.log("PRELOADING....");
  video = createVideo("./videos/testing_videos/1029_squat_000029.mp4", onVideoLoad);
  video.hide();
  video.elt.addEventListener("loadeddata", startVideoPlayback);
}

function onVideoLoad() {
  console.log("Video metadata loaded.");
  console.log("Video width: " + video.width);
  console.log("Video height: " + video.height);

  video_variables["new_width"] = video.width * (720 / video.height);
  video_variables["new_height"] = 720;

  video_variables["x_ratio"] = video_variables["new_width"] / video.width;
  video_variables["y_ratio"] = video_variables["new_height"] / video.height;

  posenet = ml5.poseNet(video, modelLoaded);
  posenet.on("pose", receivedPoses);

  // video.play();

  // // Play the video
  if (video_variables["video_loaded"]) {
    console.log("VIDEO PLAYING");
    video.loop();
  } else {
    console.log("wait");
  }

  video.onended(function () {
    // video.play();
    console.log("VIDEO ENDED");
  });
}

function startVideoPlayback() {
  console.log("Video data loaded.");
  video_variables["video_loaded"] = true;
}

function setup() {
  console.log("SETUP STARTED");
  createCanvas(1280, 720);

  let options = {
    inputs: 34,
    outputs: 2,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "model/model(2).json",
    metadata: "model/model_meta(2).json",
    weights: "model/model.weights(2).bin",
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log("pose classification ready!");
  classifyPose();
}

function classifyPose() {
  if (singlePose) {
    let inputs = [];
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      let x = singlePose.keypoints[i].position.x;
      let y = singlePose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 1000);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
  }
  console.log(results[0].confidence, results[0].label);
  classifyPose();
}

function receivedPoses(poses) {
  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

function draw() {
  push();
  // translate(video.width, 0);
  // scale(-1, 1);
  // image(video, 0, 0, video.width, video.height);
  background(255, 0, 0);
  image(
    video,
    0,
    0,
    video_variables["new_width"],
    video_variables["new_height"]
  );

  fill(255, 0, 0);
  // if (singlePose) {
  //   for (let i = 0; i < skeleton.length; i++) {
  //     let a = skeleton[i][0];
  //     let b = skeleton[i][1];
  //     strokeWeight(2);
  //     stroke(0);

  //     line(a.position.x, a.position.y, b.position.x, b.position.y);
  //   }
  //   for (let i = 0; i < singlePose.keypoints.length; i++) {
  //     let x = singlePose.keypoints[i].position.x;
  //     let y = singlePose.keypoints[i].position.y;
  //     fill(0);
  //     stroke(255);
  //     ellipse(x, y, 16, 16);
  //   }
  // }

  if (singlePose) {
    // console.log(singlePose, skeleton, "pose ");
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      if (singlePose.keypoints[i].score > 0.6) {
        ellipse(
          singlePose.keypoints[i].position.x * video_variables["x_ratio"],
          singlePose.keypoints[i].position.y * video_variables["y_ratio"],
          10 * video_variables["y_ratio"]
        );
      }
    }
   
    
    if (poseLabel == "CORRECT") {
      stroke(0, 255, 0);
      strokeWeight(5);
    } else {
      console.log(poseLabel);
      stroke(255, 255, 255);
      strokeWeight(5);
    }

    for (let j = 0; j < skeleton.length; j++) {
      line(
        skeleton[j][0].position.x * video_variables["x_ratio"],
        skeleton[j][0].position.y * video_variables["y_ratio"],
        skeleton[j][1].position.x * video_variables["x_ratio"],
        skeleton[j][1].position.y * video_variables["y_ratio"]
      );
    }

    //image(specs,singlePose.nose.x-35,singlePose.nose.y-50,80,80);
    //image(smoke,singlePose.nose.x-35,singlePose.nose.y+10,40,40);
  }
  pop();

  fill(255, 0, 255);
  noStroke();
  textSize(50);
  textAlign(CENTER, CENTER);
  text(poseLabel, width / 2, height / 2);
}

