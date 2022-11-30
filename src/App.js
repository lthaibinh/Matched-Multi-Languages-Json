/* eslint-disable no-loop-func */
import React, { Component } from "react";
import writeXlsxFile from "write-excel-file";
import readXlsxFile from 'read-excel-file'
import { reduce } from "lodash";

const unflatten = require('unflatten')
var _ = require('lodash');



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viObject: null,
      enObject: null,
      twObject: null,
      errMsg: ''
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
  handleFileExcelSelected = (e) => {
    const files = Array.from(e.target.files);
    let excelFile = files[0];
    readXlsxFile(excelFile).then( rows => {
      let fileState = e.target.name
      this.setState({
        [fileState]:rows
      })
      
      const translatedObject = Object.fromEntries(rows)
      this.handle_map_translatedObject_to_objectOrigin(translatedObject);

    })
  };
  handle_map_translatedObject_to_objectOrigin = (translatedObject) => {
    // Object.keys(person)
    let {twOriginObject} = this.state
    let twOriginArray = twOriginObject && Object.entries(twOriginObject)
    let translatedArray =  Object.entries(translatedObject)

    let resultObject = {...twOriginObject}
    if (translatedArray && translatedArray.length > 0) {
      translatedArray.forEach( (element,index) => {
        // console.log('binhtest ',element,index);
        console.log('binhtest final', index,  resultObject[`${element[0]}`]);
        resultObject[`${element[0]}`] = element[1]
        console.log('binhtest final', index,  resultObject[`${element[0]}`]);
      })
    }
    console.log('binhtest resultObject aray ', Object.entries(resultObject) );
    this.downloadFileJsonFromArray('tw.json', Object.entries(resultObject));

  }
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

  // unflatten = (data) => {
  //   var result = {};
  //   for (var i in data) {
  //     var keys = i.split(".");
  //     keys.reduce(function (r, e, j) {
  //       return (
  //         r[e] ||
  //         (r[e] = isNaN(Number(keys[j + 1]))
  //           ? keys.length - 1 === j
  //             ? data[i]
  //             : {}
  //           : [])
  //       );
  //     }, result);
  //   }
  //   return result;
  // };

  checkInvalid = () => {
    let { viObject, enObject, twObject } = this.state
    let viArray = Object.entries(viObject);
    let enArray = Object.entries(enObject);
    let twArray = Object.entries(twObject);
    let viLength = viArray.length;

    this.setState({
      errMsg: '3 file đã khớp !',
      colorMsg: 'green'
    })
    for (var i = 0; i < viLength; i++) {
      if (viArray[i][0] !== enArray[i][0]) {
        this.setState({
          errMsg: 'kiểm tra trong file en.json: ' + enArray[i][0],
          colorMsg: 'red'
        })
        break;
      }
      if (viArray[i][0] !== twArray[i][0]) {
        this.setState({
          errMsg: 'kiểm tra trong file tw.json: ' + twArray[i][0],
          colorMsg: 'red'
        })
        break;
      }
    }
    
  }
  exportFileToTranslate = (e) => {
    let name = e.target.name;
    if (name === 'tw') {
      let { twObject, viObject } = this.state
      let twArray = Object.entries(twObject);
      let viArray = Object.entries(viObject);
      let originArray = []  // lấy object tương ứng file cần dịch để translate
      let neededTranslateArray = []
      const REGEX_CHINESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
      for (var i = 0; i < twArray.length; i++) {
        const result = _.find(viArray, (element) => element[0] === twArray[i][0]); // 
        if (!twArray[i][1].match(REGEX_CHINESE)) { // không có kí tự tiếng trung nào
          if (twArray[i][1].length === 0) { //  nếu key đó rỗng, check nếu trong file vi rỗng thì không cần translate
            if (result[1].length === 0) {
              continue;
            }
          }
          neededTranslateArray.push(twArray[i])
          originArray.push(result)
        }
      }
      // let twObjectConverted = neededTranslateArray.reduce(
      //   (obj, item) => Object.assign(obj, { [item[0]]: item[1] }), {});
      let nameArray = ['tw', 'vi']
      let dataArray = [neededTranslateArray, originArray]
      this.createExcelReport('translate.xlsx', nameArray, dataArray)
    }
  }
  formatFileBasedOnVi = (dataObject, nameFile) => {
    let { viObject } = this.state
    let viArray = Object.entries(viObject);
    let dataArray = Object.entries(dataObject);
    let formattedArray = []
    for (var i = 0; i < viArray.length; i++) {
      const result = _.find(dataArray, (element) => element[0] === viArray[i][0]); // 

      if (result) {
        formattedArray.push(result)
      }
    }
    console.log(formattedArray);
    this.downloadFileJsonFromArray(nameFile, formattedArray);
  }
  downloadFileJsonFromArray = (nameFile, arrayContent) => {
    let objectData = arrayContent.reduce(
      (obj, item) => Object.assign(obj, { [item[0]]: item[1] }), {});
    let objectOrigin = unflatten(objectData)
    const blob = new Blob([JSON.stringify(objectOrigin)], { type: "application/json" }); //pass data from localStorage API to blob
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nameFile;
    // a.textContent = "Download backup.json";
    // document.body.appendChild(a); 
    a.click();

  }
  formatDataToExportExcel = (arrayContent) => {
    return arrayContent.map(e => [
      {
        value: e[0]
      },
      {
        value: e[1]
      }
    ])
  }
  createExcelReport = async (nameFile, nameArray, dataArray) => {
    let HEADER_ROW = [
      {
        value: "Tên object",
        fontWeight: "bold",
      },
      {
        value: "Nội dung",
        fontWeight: "bold"
      },
    ];
    let formattedDataArray = dataArray.map(e => [HEADER_ROW, ...this.formatDataToExportExcel(e)])
    let columns = dataArray.map(e => [
      { width: 50 },
      { width: 100 },
    ],)
    await writeXlsxFile(formattedDataArray, {
      // columns: [columns1, columns2], // (optional)
      // sheets: ['Sheet 1', 'Sheet 2'],
      columns: columns,
      sheets: nameArray,
      fileName: nameFile,
      // filePath: '/path/to/file.xlsx'
    })
  };

  render() {
    let { twObject, enObject } = this.state
    return (
      <div className="App ms-4">
        <div className="row mt-4">
          <div className="mb-3 col-4">
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
        </div>
        <div className="row mt-4">
          <div className="mb-3 col-4">
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
          <div className="col-8">
            {/* <button name="tw" onClick={this.exportFileToTranslate} className="btn btn-primary"> Kết xuất file cần translate </button> */}
            <button name="tw" onClick={() => this.formatFileBasedOnVi(enObject, 'en.json')} className="btn btn-primary"> Sort theo file Vi </button>
          </div>
        </div>
        <div className="row mt-4">
          <div className="mb-3 col-4">
            <label htmlFor="twLanguageFile" className="form-label">
              File Tiếng Trung
            </label>
            <input
              name="twObject"
              onChange={this.handleFileSelected}
              className="form-control"
              type="file"
              id="twLanguageFile"
            />
          </div>
          <div className="col-8 row">
            <div className="col-12"><button name="tw" onClick={this.exportFileToTranslate} className="btn btn-primary"> Kết xuất file cần translate </button></div>
            <div className="col-12"><button name="tw" onClick={() => this.formatFileBasedOnVi(twObject, 'tw.json')} className="btn btn-primary"> Sort theo file Vi </button></div>
          </div>

        </div>
        <div className="row mt-4">
          <div className="mb-3 col-4">
            <label htmlFor="twLanguageFile" className="form-label">
              Chép ngược file tiếng trung đã dịch vào file json
            </label>
            <div>
              <label>file excel đã dịch</label>
              <input
                name="tw_translated_object"
                onChange={this.handleFileExcelSelected}
                className="form-control"
                type="file"
                id="twLanguageFile"
            />
            </div>
            <div>
              <label>file json tw.json gốc </label>
              <input
                name="twOriginObject"
                onChange={this.handleFileSelected}
                className="form-control"
                type="file"
                id="twOriginLanguageFile"
            />
            </div>
            
          </div>
        </div>


        <button type onClick={this.checkInvalid} className="btn btn-primary">
          check 3 file json khớp key ?
        </button>
        
        <p style={{color: `${this.state.colorMsg}`}}>{this.state.errMsg}</p>
      </div>

    );
  }
}

export default App;
