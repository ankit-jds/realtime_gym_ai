let video;
let posenet;
let singlePose, skeleton;
function preload() {
  video = createVideo("./videos/New folder/1003_squat_000152.mp4");
}
function setup() {
  // console.log(video);
  createCanvas(1280, 720);
  // Load the video file
  video.hide();
  // createCanvas(video.width, video.height);

  // Enable looping for the video
  video.loop();

  // Play the video
  video.play();

  posenet = ml5.poseNet(video, modelLoaded);
  posenet.on("pose", receivedPoses);
}

function receivedPoses(poses) {
  // console.log(poses);

  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log("Model has loaded");
}

function draw() {
  // Resize the video to fit a specific height while maintaining its aspect ratio
  let video_height = video.height;
  let video_width = video.width;
  let new_width = video_width * (720 / video_height);
  let new_height = 720;
  // video.height = 720;
  // video.width = video_width * (720 / video_height);
  // console.log(pose, "huh");
  // images and videos(webcam)
  background(255, 0, 0);
  image(video, 0, 0, new_width, new_height);

  fill(255, 0, 0);

  let x_ratio = new_width / video_width;
  let y_ratio = new_height / video_height;
  if (singlePose) {
    // console.log(singlePose, skeleton, "pose ");
    for (let i = 0; i < singlePose.keypoints.length; i++) {
      if (singlePose.keypoints[i].score > 0.6) {
        ellipse(
          singlePose.keypoints[i].position.x * x_ratio,
          singlePose.keypoints[i].position.y * y_ratio,
          10 * y_ratio
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
      // console.log(angle, "if");
      stroke(0, 255, 0);
      strokeWeight(5);
    } else {
      stroke(255, 255, 255);
      strokeWeight(5);
    }

    for (let j = 0; j < skeleton.length; j++) {
      line(
        skeleton[j][0].position.x * x_ratio,
        skeleton[j][0].position.y * y_ratio,
        skeleton[j][1].position.x * x_ratio,
        skeleton[j][1].position.y * y_ratio
      );
    }

    //image(specs,singlePose.nose.x-35,singlePose.nose.y-50,80,80);
    //image(smoke,singlePose.nose.x-35,singlePose.nose.y+10,40,40);
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
