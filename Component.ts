import { Component, Inject, OnInit } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ValidationService } from 'src/app/validators/validation.service';

import { ciDialogData } from '../clean-inspect-details/clean-inspect-details.component';

import { SharedServiceService } from 'src/app/services/shared-service.service';

import { MatSnackBar } from '@angular/material/snack-bar';

import { SnackBarUtils } from '../../snackbar/snackbar-utils';

import { environment } from 'src/environments/environment';




@Component({

  selector: 'app-add-crate',

  templateUrl: './add-crate.component.html',

  styleUrls: ['./add-crate.component.scss']

})

export class AddCrateComponent implements OnInit {

  crateName: any;

  typeList = [{ name: 'Pulzia', value: 'PULIZIA' },

  { name: 'Check Ingrezzo', value: 'CHK_INGRESSO' },

  { name: 'Linea Chemical', value: 'LINEA_CHIMICA' },

  { name: 'Contolo Visovo', value: 'CHK_VISIVO' },

  { name: 'NDT', value: 'CHK_NDT' },

  { name: 'Controlo Dime', value: 'CHK_DIM' },

  { name: 'Cicilli Special', value: 'CICLILLI SPECIAL' }]

  crateTypes = ['SCRAP', 'CLEAN', 'OSS', 'IHR']

  crateDescription: any;

  jobID: any;

  crateType: any;

  public api = environment.api;

  public BASE_URL = environment.BASE_URL;

  username: any;

  userInfoSessionStorage: any;

  comments: any;

  constructor(public dialogRef: MatDialogRef<AddCrateComponent>, public dialog: MatDialog,

    @Inject(MAT_DIALOG_DATA) public data: ciDialogData, private _snackBar: MatSnackBar, private validationService: ValidationService, private sharedService: SharedServiceService,) { }




  ngOnInit(): void {

    console.log(this.data)

    this.userInfoSessionStorage = JSON.parse(sessionStorage.getItem('userInfo'))

    if (this.userInfoSessionStorage) {

      this.username = this.userInfoSessionStorage.lastName + ', ' + this.userInfoSessionStorage.firstName + ' (' + this.userInfoSessionStorage.sso + ')';

    } else {

      this.sharedService.getUserInfo().subscribe(res => {

        if (res) {

          res.roles = res.roles.filter(role => role.toUpperCase() !== 'INTEGRATION')

          this.username = res.lastName + ', ' + res.firstName + ' (' + res.sso + ')';

        }

      })

    }

    if (this.data.data == 'signalazioneAnomale') {

      this.getSignalizeData()

    }

    if (this.data.data == 'addCrate') {

      this.sharedService.httpGet(`${this.BASE_URL}${this.api.cleanInspect.getDefaultCrateNames}`).subscribe(result => {

        this.crateLists = result.data

      });

    }

    if (this.data.data == 'mapCrate') {

      this.searchCrate()

    }

  }

  crateLists = []

  displayedColumns = ['comments', 'createdBy', 'createdDate']

  signalizeData = []

  getSignalizeData() {

    let payload = {

      "cleanInspectDispositionId": this.data.list[0].cleanInspectDispositionId,

      "cleanInspectPartSerialId": this.data.list[0].cleanInspectPartSerialId

    }

    this.sharedService.httpPost(`${this.BASE_URL}${this.api.cleanInspect.getCommentSignalazioneAnomale}`, payload).subscribe((result: any) => {

      this.signalizeData = result.data

    })

  }

  saveComments() {

    let payload = {

      "createdBy": this.username,

      "comment": this.comments,

      "cleanInspectDispositionId": this.data.list[0].cleanInspectDispositionId,

      "cleanInspectPartSerialId": this.data.list[0].cleanInspectPartSerialId

    }

    this.sharedService.httpPost(`${this.BASE_URL}${this.api.cleanInspect.addCommentSignalazioneAnomale}`, payload).subscribe((result: any) => {

      SnackBarUtils.customSuccessMessage(this._snackBar, 'Comments saved successfully')

      this.dialogRef.close()

    })

  }

  addCrate() {

    if (!this.validationService.validatedropdown(this.crateName)) {

      SnackBarUtils.customErrorMessage(this._snackBar, 'Please select valid crate name')

    } else if (!this.validationService.validatedropdown(this.crateDescription)) {

      SnackBarUtils.customErrorMessage(this._snackBar, 'Please enter valid crate description')

    } else if (!this.validationService.validatedropdown(this.jobID)) {

      SnackBarUtils.customErrorMessage(this._snackBar, 'Please enter valid Job Id')

    } else if (!this.validationService.validatedropdown(this.crateType)) {

      SnackBarUtils.customErrorMessage(this._snackBar, 'Please select crate type')

    } else {

      let payload = {

        search: this.data.payload,

        data: [

          {

            "crateName": this.crateName,

            "description": this.crateDescription,

            "jobNumber": this.jobID,

            "crateType": this.crateType,

            "createdBy": this.username

          }]

      }

      this.sharedService.httpPost(`${this.BASE_URL}${this.api.cleanInspect.addCrate}`, payload).subscribe((result: any) => {

        SnackBarUtils.customSuccessMessage(this._snackBar, 'Crate added successfully')

        this.dialogRef.close({ result: true, data: result.data });

      })

    }




  }

  crateNameSelect(crate) {

    this.crateDescription = crate.description

    this.crateId = crate.id

  }

  crateId = null

  assignCrate() {

    if (this.crateId == null) {

      SnackBarUtils.customErrorMessage(this._snackBar, 'Please Select the crate from the provided list')

    } else {

      this.dialogRef.close({

        result: true, data: { crateName: this.crateName, crateDescription: this.crateDescription, crateId: this.crateId }

      });

    }




  }

  crateList = []

  searchCrate() {

    // if (this.crateName.length >= 3) {

    let payload = {

      "crateName": null,

      "jobId": this.data.payload.jobId

    }

    this.sharedService.httpPost(`${this.BASE_URL}${this.api.cleanInspect.srchCrate}`, payload).subscribe(result => {

      this.crateList = result.data

    })

    // }

  }

  close() {

    this.dialogRef.close();

  }

  type: any = null;

  name: any = null;

  manuale: any = null;

  url: any = null;

  formula: any = null;

  note: any = null;

  ore: any = null;

  description: any = null;

  addNewMethodType() {

    if (this.validationService.validatedropdown(this.type) &&

      this.validationService.validatedropdown(this.name)) {

      if (this.validationService.validateNum(this.ore)) {

        this.dialogRef.close({

          result: true, data: [{

            "methodType": this.type,

            "methodName": this.name,

            "methodManual": this.manuale,

            "manualUrl": this.url,

            "methodFormula": this.formula,

            "methodNote": this.note,

            "methodHour": Number(this.ore),

            "methodDescription": this.description,

            "createdBy": this.username

          }]

        });

      } else {

        SnackBarUtils.customErrorMessage(this._snackBar, 'Ore should be a number');

      }




    } else {

      SnackBarUtils.customErrorMessage(this._snackBar, 'Please enter required details to add method type');

    }




  }




}
