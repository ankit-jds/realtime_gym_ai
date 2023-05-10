let videos = [
  "./videos/rounded_back/1003_squat_000148.mp4",
  "./videos/rounded_back/1003_squat_000149.mp4",
  "./videos/rounded_back/1003_squat_000150.mp4",
  "./videos/rounded_back/1003_squat_000151.mp4",
  "./videos/rounded_back/1003_squat_000152.mp4",
  "./videos/rounded_back/1003_squat_000153.mp4",
  "./videos/rounded_back/1003_squat_000154.mp4",
  "./videos/rounded_back/1003_squat_000155.mp4",
];
let currentVideo = 0;

let video;
let video_variables = {};

let state = "collecting";
let posenet;
let singlePose, skeleton;
let brain;

function preload() {
  console.log("PRELOADING....");
  video = createVideo(videos[currentVideo], onVideoLoad);
  video.hide();
  video.elt.addEventListener("loadeddata", startVideoPlayback);
}

function onVideoLoad() {
  console.log("Video metadata loaded.");

  video_variables["new_width"] = video.width * (720 / video.height);
  video_variables["new_height"] = 720;

  video_variables["x_ratio"] = video_variables["new_width"] / video.width;
  video_variables["y_ratio"] = video_variables["new_height"] / video.height;

  // // Play the video
  if (video_variables["video_loaded"]) {
    console.log("VIDEO PLAYING");
    video.play();
  } else {
    console.log("wait");
  }

  video.onended(function () {
    // brain.saveData();
    console.log(`VIDEO no:${currentVideo} ENDED`);
    currentVideo++;

    video.pause(); // Pause the video before removing it
    video.parent().removeChild(video.elt); // Remove the video element from its parent node

    if (currentVideo >= videos.length) {
      console.log("ALL VIDEOS ENDED....");
      console.log("EXPORTING DATA....");
      brain.saveData();
    } else {
      console.log("preload again");
      preload();
    }
  });
}

function startVideoPlayback() {
  console.log("Video data loaded.");
  video_variables["video_loaded"] = true;

  if (posenet) {
    posenet.removeAllListeners(); // Remove all existing event listeners
  }

  posenet = ml5.poseNet(video, modelLoaded);
  posenet.on("pose", receivedPoses);
}

function setup() {
  console.log("SETUP STARTED");
  createCanvas(1280, 720);

  let options = {
    inputs: 34,
    outputs: 4,
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
}

function receivedPoses(poses) {
  // console.log(poses);
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
      let target = ["round_back"];
      brain.addData(inputs, target);
    }
  }
}

function modelLoaded() {
  console.log("Model has loaded");
}

function draw() {
  // Resize the video to fit a specific height while maintaining its aspect ratio

  background(255, 0, 0);
  image(
    video,
    0,
    0,
    video_variables["new_width"],
    video_variables["new_height"]
  );

  fill(255, 0, 0);

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
    let leftAnkleX = singlePose.leftAnkle.x;
    let leftAnkleY = singlePose.leftAnkle.y;
    let leftHipX = singlePose.leftHip.x;
    let leftHipY = singlePose.leftHip.y;
    let leftKneeX = singlePose.leftKnee.x;
    let leftKneeY = singlePose.leftKnee.y;

    let angle = calcAngle(
      leftAnkleX,
      leftAnkleY,
      leftKneeX,
      leftKneeY,
      leftHipX,
      leftHipY
    );
    // console.log(angle);
    if (angle < 124) {
      // console.log(angle, "if");
      stroke(0, 255, 0);
      strokeWeight(5);
    } else {
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
}

function calcAngle(x1, y1, x2, y2, x3, y3) {
  // Calculate the vectors between the points
  let v1x = x1 - x2;
  let v1y = y1 - y2;
  let v2x = x3 - x2;
  let v2y = y3 - y2;

  // Calculate the dot product of the vectors
  let dotProduct = v1x * v2x + v1y * v2y;

  // Calculate the magnitudes of the vectors
  let v1mag = Math.sqrt(v1x * v1x + v1y * v1y);
  let v2mag = Math.sqrt(v2x * v2x + v2y * v2y);

  // Calculate the cosine of the angle between the vectors
  let cosAngle = dotProduct / (v1mag * v2mag);

  // Convert the cosine to an angle in degrees
  let angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;

  return angleDeg;
}
