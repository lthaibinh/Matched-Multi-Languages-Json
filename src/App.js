/* eslint-disable no-loop-func */
import React, { Component } from "react";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viObject: null,
      enObject: null,
      twObject: null,
    };
  }

  handleFileSelected = (e) => {
    const files = Array.from(e.target.files);
    let jsonFile = files[0];
    var viReader = new FileReader();
    let fileState = e.target.name
    viReader.onload = (event) => this.onReaderLoad(event, fileState);
    viReader.readAsText(jsonFile);
  };
  onReaderLoad = (event, fileState) => {
    // console.log(event.target.result);
    var obj = JSON.parse(event.target.result);

    const object_flattern = Object.keys(obj).reduce(
      (prev, curr) => this.flat(prev, curr, obj[curr]),
      {}
    );
    this.setState({
      [fileState]: object_flattern,
    });
  };
  flat = (res, key, val, pre = "") => {
    const prefix = [pre, key].filter((v) => v).join(".");
    return typeof val === "object"
      ? Object.keys(val).reduce(
          (prev, curr) => this.flat(prev, curr, val[curr], prefix),
          res
        )
      : Object.assign(res, { [prefix]: val });
  };

  unflatten = (data) => {
    var result = {};
    for (var i in data) {
      var keys = i.split(".");
      keys.reduce(function (r, e, j) {
        return (
          r[e] ||
          (r[e] = isNaN(Number(keys[j + 1]))
            ? keys.length - 1 === j
              ? data[i]
              : {}
            : [])
        );
      }, result);
    }
    return result;
  };

  checkInvalid = () => {
    let {viObject, enObject, twObject} = this.state
    let viArray = Object.entries(viObject);
    let enArray = Object.entries(enObject);
    let twArray = Object.entries(twObject);
    let viLength = viArray.length;
    for (var i = 0; i < viLength; i++) {
      if(viArray[i][0] !== enArray[i][0] ){
        console.log('binhtest file en', enArray[i][0] );
        break;
      }
      if(viArray[i][0] !== twArray[i][0] ){
        console.log('binhtest file tw', twArray[i][0] );
        break;
      }
    }
    console.log('binhtest 3 file matched');
  }
  render() {
    return (
      <div className="App">
        <div>
          <div className="mb-3">
            <label htmlFor="viLanguageFile" className="form-label">
              File Tiếng Việt
            </label>
            <input
              name="viObject"
              onChange={this.handleFileSelected}
              className="form-control"
              type="file"
              id="viLanguageFile"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="enLanguageFile" className="form-label">
              File Tiếng anh
            </label>
            <input
              name="enObject"
              onChange={this.handleFileSelected}
              className="form-control"
              type="file"
              id="enLanguageFile"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="twLanguageFile" className="form-label">
              File Tiếng anh
            </label>
            <input
              name="twObject"
              onChange={this.handleFileSelected}
              className="form-control"
              type="file"
              id="twLanguageFile"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="exampleInputPassword1" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleInputPassword1"
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="exampleCheck1"
            />
            <label className="form-check-label" htmlFor="exampleCheck1">
              Check me out
            </label>
          </div>
          <button type onClick={this.checkInvalid} className="btn btn-primary">
            Submit
          </button>
        </div>
      </div>
    );
  }
}

export default App;
