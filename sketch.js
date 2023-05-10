let capture;
let posenet;
let singlePose, skeleton;

function setup() {
  // createCanvas(capture.width, capture.height);
  createCanvas(640, 480);
  capture = createCapture(VIDEO);
  capture.hide();
  console.log(capture, "capture");

  posenet = ml5.poseNet(capture, modelLoaded);
  posenet.on("pose", receivedPoses);
}

function receivedPoses(poses) {
  // console.log(poses);

  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;
    // console.log(skeleton);
  }
}

function modelLoaded() {
  console.log("Model has loaded");
}

function draw() {
  // images and videos(webcam)
  image(capture, 0, 0);
  fill(255, 0, 0);

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
    let leftAnkleX = singlePose.leftAnkle.x;
    let leftAnkleY = singlePose.leftAnkle.y;
    let leftHipX = singlePose.leftHip.y;
    let leftHipY = singlePose.leftHip.y;
    let leftKneeX = singlePose.leftKnee.y;
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
      console.log(angle, "if");
      stroke(0, 255, 0);
      strokeWeight(5);
    } else {
      stroke(255, 255, 255);
      strokeWeight(5);
    }

    for (let j = 0; j < skeleton.length; j++) {
      if (skeleton[j][0].score > 0.6 && skeleton[j][1].score) {
        line(
          skeleton[j][0].position.x,
          skeleton[j][0].position.y,
          skeleton[j][1].position.x,
          skeleton[j][1].position.y
        );
      }
    }
  }
}

function calcAngle(x1, y1, x2, y2, x3, y3) {
  // Calculate the vectors between the points
  const v1x = x1 - x2;
  const v1y = y1 - y2;
  const v2x = x3 - x2;
  const v2y = y3 - y2;

  // Calculate the dot product of the vectors
  const dotProduct = v1x * v2x + v1y * v2y;

  // Calculate the magnitudes of the vectors
  const v1mag = Math.sqrt(v1x * v1x + v1y * v1y);
  const v2mag = Math.sqrt(v2x * v2x + v2y * v2y);

  // Calculate the cosine of the angle between the vectors
  const cosAngle = dotProduct / (v1mag * v2mag);

  // Convert the cosine to an angle in degrees
  const angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;

  return angleDeg;
}
