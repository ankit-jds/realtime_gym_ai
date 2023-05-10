let videos = [
  "./videos/New folder/1003_squat_000148.mp4",
  "./videos/New folder/1003_squat_000149.mp4",
  "./videos/New folder/1003_squat_000150.mp4",
  "./videos/New folder/1003_squat_000151.mp4",
  "./videos/New folder/1003_squat_000152.mp4",
  "./videos/New folder/1003_squat_000153.mp4",
  "./videos/New folder/1003_squat_000154.mp4",
  "./videos/New folder/1003_squat_000155.mp4",
];
let currentVideo = 0;
let video;

let posenet;
let singlePose, skeleton;
let brain;
let state = "collecting";

function setup() {
  createCanvas(1280, 720);

  playNextVideo();

  posenet = ml5.poseNet(video, modelLoaded);
  posenet.on("pose", receivedPoses);
}

function modelLoaded() {
  console.log("Model has loaded");
}

function receivedPoses(poses) {
  // console.log(poses);

  if (poses.length > 0) {
    singlePose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function playNextVideo() {
  // Create a new video object and load the next video in the playlist
  video = createVideo(videos[currentVideo], onVideoLoad);
  video.hide();

  // When the video ends, call playNextVideo() to start the next video in the playlist
  video.elt.onended = function () {
    currentVideo++;
    video.remove(); // Remove the previous video from the DOM to prevent memory leaks
    if (currentVideo >= videos.length) {
      // brain.saveData();
    }else{
      playNextVideo();
    }
  };
}

function onVideoLoad() {
  console.log("Video metadata loaded.", currentVideo);

  // Play the video
  video.play();

  // Set the video element for the PoseNet model
  posenet.video = video.elt;
}

function draw() {
  // Resize the video to fit a specific height while maintaining its aspect ratio
  let video_height = video.height;
  let video_width = video.width;
  let new_width = video_width * (720 / video_height);
  let new_height = 720;
  background(255, 0, 0);
  image(video, 0, 0, new_width, new_height);

  fill(255, 0, 0);
  stroke(255, 255, 255);
  strokeWeight(5);

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

    for (let j = 0; j < skeleton.length; j++) {
      line(
        skeleton[j][0].position.x * x_ratio,
        skeleton[j][0].position.y * y_ratio,
        skeleton[j][1].position.x * x_ratio,
        skeleton[j][1].position.y * y_ratio
      );
    }
  }
}
