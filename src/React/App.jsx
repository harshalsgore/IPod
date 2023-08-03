import React, { Component } from "react";
import { ArrayList } from "./arrayList.jsx";
import IPod from "./IPod.jsx";
import ZingTouch from "zingtouch";
import "../CSS/App.css";

export default class App extends Component {
  constructor() {
    super();

    this.wheelRef = React.createRef();
    this.zingtouch = null;
    this.distance = 0;
    this.sensitivity = 25;

    this.songsArray = ArrayList.Songs;
    this.currentSongIndex = 0;

    this.btnFunction = {
      menuOrBack: this.menuOrBack,
      okButtonHandle: this.okButtonHandle,
      playBtn: this.playBtn,
      forwardBtn: this.forwardBtn,
      backwardBtn: this.backwardBtn,
      seekBarChange: this.seekBarChange,
    };

    this.state = {
      menuQueue: [0],
      selectedMenu: 0,
      selectedOption: 0,
      menuArray: Object.values(ArrayList)[0],
      singlePage: false,
      currentSong: new Audio(this.songsArray[0].source),
    };
  }

  componentDidMount() {
    const wheel = this.wheelRef.current;
    this.zingtouch = new ZingTouch.Region(wheel);
    this.bindRotationGesture();
  }

  bindRotationGesture = () => {
    const wheel = this.wheelRef.current;
    const myGesture = new ZingTouch.Rotate();

    const menuArray = Object.values(ArrayList)[this.state.selectedMenu];

    this.zingtouch.bind(wheel, myGesture, (event) => {
      if (!this.state.currentSong.paused) return;

      if (Math.floor(event.detail.distanceFromOrigin) === 0) {
        this.distance = 0;
      }

      if (
        Math.abs(this.distance - event.detail.distanceFromOrigin) >
        this.sensitivity
      ) {
        const menuName = Object.keys(ArrayList)[this.state.selectedMenu];

        let newState;
        if (this.distance - event.detail.distanceFromOrigin < 0) {
          newState = (this.state.selectedOption + 1) % menuArray.length;
        } else {
          newState =
            (this.state.selectedOption - 1 + menuArray.length) %
            menuArray.length;
        }
        this.setState((prevState) => {
          if (menuName === "Songs") {
            this.currentSongIndex = newState;
            return {
              currentSong: new Audio(this.songsArray[newState].source),
              selectedOption: newState,
            };
          } else {
            return { selectedOption: newState };
          }
        });
        this.distance = event.detail.distanceFromOrigin;
      }
    });
  };

  menuOrBack = () => {
    let newMenuQueue = this.state.menuQueue;

    if (newMenuQueue.length === 1 || !this.state.currentSong.paused) {
      console.log(
        `sorry, selected Option has no effect, ${
          !this.state.currentSong.paused ? "Song is playing" : "you are on top"
        }`
      );
      return;
    }

    newMenuQueue.pop();
    const newSelectedMenu = newMenuQueue[newMenuQueue.length - 1];
    this.setState({
      menuQueue: newMenuQueue,
      selectedMenu: newSelectedMenu,
      selectedOption: 0,
      menuArray: Object.values(ArrayList)[newSelectedMenu],
      singlePage: false,
    });
  };

  okButtonHandle = (option) => {
    let newMenuQueue = this.state.menuQueue;
    const length = newMenuQueue.length;

    if (newMenuQueue[length - 1] === newMenuQueue[length - 2]) {
      console.log(
        `sorry, selected Option has no effect, ${
          !this.state.currentSong.paused
            ? "Song is playing"
            : "you are on root of App"
        }`
      );
      return;
    }

    const newSelectedMenu =
      Object.values(ArrayList)[this.state.selectedMenu][option].parentIndex;
    newMenuQueue.push(newSelectedMenu);

    if (newSelectedMenu === this.state.selectedMenu) {
      this.setState({
        singlePage: true,
        menuQueue: newMenuQueue,
        selectedMenu: newSelectedMenu,
        selectedOption: 0,
        menuArray: Object.values(ArrayList)[option],
      });
      return;
    }

    this.setState({
      singlePage: false,
      menuQueue: newMenuQueue,
      selectedMenu: newSelectedMenu,
      selectedOption: 0,
      menuArray: Object.values(ArrayList)[option],
    });
  };

  playBtn = () => {
    if (this.state.currentSong.paused) {
      this.state.currentSong.play();
    } else {
      this.state.currentSong.pause();
    }
  };

  forwardBtn = () => {
    this.state.currentSong.pause();
    this.currentSongIndex = ++this.currentSongIndex % this.songsArray.length;
    const newCurrentSong = new Audio(
      this.songsArray[this.currentSongIndex].source
    );
    newCurrentSong.play();

    this.setState({
      currentSong: newCurrentSong,
    });
  };

  backwardBtn = () => {
    this.state.currentSong.pause();
    this.currentSongIndex =
      this.currentSongIndex === 0
        ? this.songsArray.length - 1
        : --this.currentSongIndex;
    const newCurrentSong = new Audio(
      this.songsArray[this.currentSongIndex].source
    );
    newCurrentSong.play();

    this.setState({
      currentSong: newCurrentSong,
    });
  };

  render() {
    return (
      <>
        <IPod
          selectedMenu={this.state.selectedMenu}
          selectedOption={this.state.selectedOption}
          singlePage={this.state.singlePage}
          currentSong={this.state.currentSong}
          currentSongIndex={this.currentSongIndex}
          btnFunction={this.btnFunction}
          wheelRef={this.wheelRef}
        />
      </>
    );
  }
}
