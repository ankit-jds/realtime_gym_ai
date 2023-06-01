let video;
let poseNet;
let singlePose;
let skeleton;

let video_variables = {};

let brain;

let state = "waiting";
let targetLabel;

function keyPressed() {
  if (key == "s") {
    brain.saveData();
  } else {
    targetLabel = key;
    console.log(targetLabel);
    setTimeout(function () {
      console.log("collecting");
      state = "collecting";
      setTimeout(function () {
        console.log("not collecting");
        state = "waiting";
      }, 30000);
    }, 10000);
  }
}

function setup() {
  createCanvas(640, 500);

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
    // minConfidence: 0.5,
    maxPoseDetections: 1,
    // scoreThreshold: 0.5,
    detectionType: "single",
  };

  poseNet = ml5.poseNet(video, posenet_options, modelLoaded);
  poseNet.on("pose", gotPoses);

  let options = {
    inputs: 34,
    outputs: 2,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
}

function gotPoses(poses) {
//   console.log(poses);
  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == "collecting") {
      let inputs = [];
      for (let i = 0; i < singlePose.keypoints.length; i++) {
        let x = singlePose.keypoints[i].position.x;
        let y = singlePose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}

function modelLoaded() {
  console.log("poseNet ready");
}

// function draw() {
//   translate(video.width, 0);
//   scale(-1, 1);
//   image(video, 0, 0, video.width, video.height);

//   if (pose) {
//     for (let i = 0; i < skeleton.length; i++) {
//       let a = skeleton[i][0];
//       let b = skeleton[i][1];
//       strokeWeight(2);
//       stroke(0);

//       line(a.position.x, a.position.y, b.position.x, b.position.y);
//     }
//     for (let i = 0; i < pose.keypoints.length; i++) {
//       let x = pose.keypoints[i].position.x;
//       let y = pose.keypoints[i].position.y;
//       fill(0);
//       stroke(255);
//       ellipse(x, y, 16, 16);
//     }
//   }
// }

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

      if (targetLabel == "CORRECT") {
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

    // document.getElementById("prompt").innerText = poseLabel;
    // fill(255, 0, 255);
    // translate(video_variables["new_width"], 0);
    // scale(-1, 1);
    noStroke();
    // textSize(100);
    // textAlign(CENTER, CENTER);
    // text(poseLabel, width / 2, height / 2);
  }
