let video;
let video_variables = {};
let posenet;

let singlePose, skeleton;
let state = "collecting";

let brain;

let poseLabel = "INCORRECT";

function setup() {
  console.log("SETUP STARTED");

  video = createCapture(VIDEO);
  console.log(video_variables, video.width, video.height, 12315);
  video_variables["new_width"] = 640 * (500 / 480);
  video_variables["new_height"] = 500;

  createCanvas(video_variables["new_width"], video_variables["new_height"]);
  video_variables["x_ratio"] = video_variables["new_width"] / 640;
  video_variables["y_ratio"] = video_variables["new_height"] / 480;
  console.log(video_variables, video.width, video.height);
  video.hide();

  let posenet_options = {
    architecture: "MobileNetV1",
    // architecture: "ResNet50",
    maxPoseDetections: 1,
    detectionType: "single",
  };
  poseNet = ml5.poseNet(video, posenet_options, modelLoaded);
  poseNet.on("pose", receivedPoses);

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
    setTimeout(classifyPose, 50);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
    if (poseLabel==="C"){
      poseLabel="CORRECT"
    }
    
    if (poseLabel==="I"){
      poseLabel="INCORRECT"
    }
    // console.log(results[0].confidence, results[0].label);
  }
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
  // push();
  translate(video_variables["new_width"], 0);
  scale(-1, 1);
  // image(video, 0, 0, video.width, video.height);
  background(255, 0, 0);
  image(
    video,
    0,
    0,
    video_variables["new_width"],
    video_variables["new_height"]
  );

  fill(0, 0, 255);

  if (singlePose) {
    // console.log(singlePose, skeleton, "pose ");
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      if (singlePose.keypoints[i].score > 0.6) {
        ellipse(
          singlePose.keypoints[i].position.x * video_variables["x_ratio"],
          singlePose.keypoints[i].position.y * video_variables["y_ratio"],
          10
        );
      }
    }

    if (poseLabel == "CORRECT") {
      stroke(0, 255, 0);
      strokeWeight(5);
    } else {
      // console.log(poseLabel);
      stroke(255, 0, 0);
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
  }

  document.getElementById("prompt").innerText = poseLabel;
  // fill(255, 0, 255);
  // translate(video_variables["new_width"], 0);
  // scale(-1, 1);
  noStroke();
  // textSize(100);
  // textAlign(CENTER, CENTER);
  // text(poseLabel, width / 2, height / 2);
}
