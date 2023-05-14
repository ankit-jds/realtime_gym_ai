let video;
let posenet;

let singlePose, skeleton;
let state = "collecting";

let brain;

let poseLabel = "rounded_back";

function setup() {
  console.log("SETUP STARTED");
  createCanvas(1000, 500);

  video = createCapture(VIDEO);
  video.hide();

  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", receivedPoses);

  let options = {
    inputs: 34,
    outputs: 2,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
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
  // translate(video.width, 0);
  // scale(-1, 1);
  // image(video, 0, 0, video.width, video.height);
  background(255, 0, 0);
  image(video, 0, 0);

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

  if (singlePose) {
    // console.log(singlePose, skeleton, "pose ");
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      if (singlePose.keypoints[i].score > 0.6) {
        ellipse(
          singlePose.keypoints[i].position.x,
          singlePose.keypoints[i].position.y,
          10
        );
      }
    }

    if (poseLabel == "CORRECT") {
      stroke(0, 255, 0);
      strokeWeight(5);
    } else {
      // console.log(poseLabel);
      stroke(255, 255, 255);
      strokeWeight(5);
    }

    for (let j = 0; j < skeleton.length; j++) {
      line(
        skeleton[j][0].position.x,
        skeleton[j][0].position.y,
        skeleton[j][1].position.x,
        skeleton[j][1].position.y
      );
    }
  }

  fill(255, 0, 255);
  noStroke();
  textSize(100);
  textAlign(CENTER, CENTER);
  text(poseLabel, width / 2, height / 2);
}
