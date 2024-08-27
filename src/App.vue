<template>
  <div data-app class="flex_row" style="height: 100vh;">
    <v-overlay :value="loading" absolute>
      <v-progress-circular
        indeterminate
        size="40"
      ></v-progress-circular>
    </v-overlay>

    <v-snackbar
      :timeout="-1"
      :value="notif"
      color="#E53935"
      transition="fade-transition"
      style="margin-bottom: 50px;"
    >
      please select a difficulty
    </v-snackbar>

    <v-dialog :value="settingBtn" @click:outside="settingBtn = false" width="350px">
      <v-card height="390px">
        <v-card-title style="background-color: #cfd8dc; font-weight: 900;">Settings</v-card-title>

        <div :key="settingKey" style="margin-top: 8px;">
          <div v-for="item in Object.keys(setting)" style="display: flex; align-items: start; margin-bottom: 20px; margin-left: 10px;">
            <v-icon color="#000" size="20" style="margin-right: 10px;">{{ setting[item][0] }}</v-icon>
            <div>
              <p style="font-weight: 500; font-size: 20px;">{{ setting[item][1] }}</p>
              <p style="font-size: 12px; font-weight: 100; color: #757575; width: 180px;">{{ setting[item][4] }}</p>
            </div>
            <v-icon size="40" :color="setting[item][3]" @click="settingChange(item)" style="position: absolute; right: 8px;">{{ setting[item][2] }}</v-icon>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog :value="isGameOver" @click:outside="isGameOver = false" width="300px">
      <v-card height="190px" style="justify-content: start !important;" class="flex_col">
        <p class="game_over_title">Game Over</p>
        <p class="game_over_text">You lost the game because you made 3 mistakes</p>
        <div class="flex_row" style="position: absolute; bottom: 20px;">
          <v-btn color="#1E88E5" style="color: white !important; width: 120px; margin-right: 20px;" @click="newGame()">New Game</v-btn>
          <v-btn color="#1E88E5" style="color: white !important; width: 120px;" @click="restart()">Restart</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <div style="margin-right: 80px;" class="flex_col">
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 15px;">
        <v-select
          label="Difficulty"
          :items="difficulties"
          item-text="name"
          item-value="value"
          v-model="selectedDifficulty"
          class="difficulty_select"
          dense
          outlined
          single-line>
        </v-select>

        <p v-if="setting.mistake[2] == 'mdi-toggle-switch'">{{ 'Mistakes: ' + mistakeCount + ' / 3' }}</p>
        <p v-else>{{ 'Mistakes: ' + mistakeCount}}</p>

        <p v-if="setting.timer[2] == 'mdi-toggle-switch'">{{ time.minute + ':' + time.second }}</p>

        <v-icon size="30" color="#000" @click="settingBtn = true">mdi-cog-outline</v-icon>
      </div>

      <div v-click-outside="removeMainBoxColor" :key="gridKey">
        <v-row v-for="i in [0,1,2,3,4,5,6,7,8]" class="main_row">
          <v-col v-for="j in [0,1,2,3,4,5,6,7,8]" class="main_col">
            <v-btn
              v-if="notesGrid[i][j].length != 0"
              class="main_box_note"
              :style="getStyle(i, j)"
              outlined
              @click="mainBoxClick(i, j)">
            <p v-if="notesGrid[i][j].includes(1)" style="position: absolute; left: 0px; top: -22px;">1</p>
            <p v-if="notesGrid[i][j].includes(2)" style="position: absolute; left: 20px; top: -22px;">2</p>
            <p v-if="notesGrid[i][j].includes(3)" style="position: absolute; left: 38px; top: -22px;">3</p>
            <p v-if="notesGrid[i][j].includes(4)" style="position: absolute; left: 0px; top: -5px;">4</p>
            <p v-if="notesGrid[i][j].includes(5)" style="position: absolute; left: 20px; top: -5px;">5</p>
            <p v-if="notesGrid[i][j].includes(6)" style="position: absolute; left: 38px; top: -5px;">6</p>
            <p v-if="notesGrid[i][j].includes(7)" style="position: absolute; left: 0px; top: 12px;">7</p>
            <p v-if="notesGrid[i][j].includes(8)" style="position: absolute; left: 20px; top: 12px;">8</p>
            <p v-if="notesGrid[i][j].includes(9)" style="position: absolute; left: 38px; top: 12px;">9</p>
            </v-btn>
            <v-btn
              v-else
              class="main_box"
              :style="getStyle(i, j)"
              outlined
              @click="mainBoxClick(i, j)">
            {{ getMainBoxNumber(i, j) }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
    
    <div class="flex_col">
      <div class="flex_row" style="margin-right: 9px; color: #2962FF;">
        <!-- <div>
          <v-btn class="circle_btn" color="#E3F2FD" rounded>
            <v-icon color="#2962FF" size="30">mdi-arrow-u-left-top</v-icon>
          </v-btn>
          <p class="circle_txt">Undo</p>
        </div> -->
        <div>
          <v-btn class="circle_btn" color="#E3F2FD" rounded @click="eraseClick()">
            <v-icon color="#2962FF" size="30">mdi-eraser</v-icon>
          </v-btn>
          <p class="circle_txt">Erase</p>
        </div>
        <div dir="rtl">
          <div class="circle_notes" :style="getNotesCircleStyle()">
            <p>{{ notesOnOff }}</p>
          </div>
          <v-btn class="circle_btn" color="#E3F2FD" rounded @click="notesClick()">
            <v-icon color="#2962FF" size="30">mdi-pencil-outline</v-icon>
          </v-btn>
          <p class="circle_txt">Notes</p>
        </div>
        <div dir="rtl">
          <div class="circle_hint" v-if="hintNumber != 0">
            <p>{{ hintNumber }}</p>
          </div>
          <v-btn class="circle_btn" color="#E3F2FD" rounded @click="hintClick()" :disabled="hintNumber == 0">
            <v-icon color="#2962FF" size="30">mdi-lightbulb-outline</v-icon>
          </v-btn>
          <p class="circle_txt" :style="getHintStyle()">Hint</p>
        </div>
      </div>

      <div :key="numBoxKey">
        <v-row v-for="i in [0,1,2]" class="num_row">
          <v-col v-for="j in [0,1,2]" class="num_col">
            <div v-if="setting.remainingNumbers[2] == 'mdi-toggle-switch'">
              <v-btn class="num_box" color="#E3F2FD" @click="numBoxClick(i, j)" @contextmenu.prevent="numBoxRightClick(i, j)" :disabled="numBoxDisable[(i*3 + j + 1)]">
                {{ i*3 + j + 1 }}
                <p style="position: absolute; left: 0; bottom: -10px; font-size: 17px; color: #616161;">{{ getRemainingNumbers(i*3 + j + 1) }}</p>
              </v-btn>
            </div>
            <div v-else>
              <v-btn class="num_box" color="#E3F2FD" @click="numBoxClick(i, j)">{{ i*3 + j + 1 }}</v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-btn class="new_game_btn" color="#1E88E5" @click="newGame">new game</v-btn>
    </div>

  </div>
</template>

<script>
import api from '@/api'

export default {
  name: 'App',
  data() {
    return {
      main_box_color: [
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null]
      ],
      color_null: null,
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      originalGrid: null,
      solutionGrid: null,
      loading: false,
      difficulties: [{name: 'Easy', value: 1}, {name: 'Medium', value: 2}, {name: 'Hard', value: 3}, {name: 'Expert', value: 4}, {name: 'Extreme', value: 5}],
      selectedDifficulty: null,
      notif: false,
      selectedBox: null,
      gridKey: 0,
      colors: {
        mainBoxBorder: '#00B0FF',
        input: '#2962FF',
        wrongBackground: '#FFCDD2',
        clickedBox: '#81D4FA',
        clickedBoxExtra: '#E1F5FE',
        clickedBoxSameNumber: '#BBDEFB',
        victory: '#18FFFF',
        hint: '#76FF03',
      },
      settingBtn: false,
      setting: {
        timer: ['mdi-clock-time-three-outline', 'Timer', 'mdi-toggle-switch', '#4FC3F7', ''],
        mistake: ['mdi-close-circle-outline', 'Mistakes Limit', 'mdi-toggle-switch', '#4FC3F7', 'You lost the game because you made 3 mistakes'],
        regionHighlight: ['mdi-cube-unfolded', 'Region Highlight', 'mdi-toggle-switch', '#4FC3F7', 'Highlights the row, column, block of selected cell'],
        sameNumberHighlight: ['mdi-numeric-9-plus-box', 'Highlight Same Numbers', 'mdi-toggle-switch', '#4FC3F7', 'when a cell is selected, all the other cells with the same number in will be highlighted'],
        remainingNumbers: ['mdi-numeric', 'Remaining Numbers', 'mdi-toggle-switch', '#4FC3F7', ''],
      },
      settingKey: 999,
      isPlaying: false,
      remainingNumbers: {
        1: 9,
        2: 9,
        3: 9,
        4: 9,
        5: 9,
        6: 9,
        7: 9,
        8: 9,
        9: 9,
      },
      numBoxDisable: {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
      },
      numBoxClicked: false,
      numBoxKey: 99,
      hintNumber: 3,
      notesOnOff: 'off',
      hintedCells: null,
      notesGrid: null,
      time: {minute: '00', second: '00'},
      timer: null,
      mistakeCount: 0,
      isGameOver: false
    }
  },
  created() {
    this.color_null = JSON.parse(JSON.stringify(this.main_box_color))
    this.notesGrid = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
    window.addEventListener('keydown', this.handleKeyDown);
    let tmp = localStorage.getItem('setting');
    if (![undefined, null].includes(tmp))
      this.setting = JSON.parse(tmp)
  },
  methods: {
    async newGame() {
      if (this.selectedDifficulty == null) {
        this.notif = true
        setTimeout(() => {
          this.notif = false
        }, 2000);
        return
      }

      this.loading = true
      await api.getSudoku({difficulty: this.selectedDifficulty}).then(({data}) => {
        this.grid = JSON.parse(JSON.stringify(data.grid))
        this.originalGrid = JSON.parse(JSON.stringify(data.grid))
        this.solutionGrid = JSON.parse(JSON.stringify(data.solution))
      })

      this.restart()

      this.loading = false
      this.gridKey++
    },
    getStyle(i, j) {
      let style = {borderColor: '#000'}
      let width = '2px'
      let color = this.colors.mainBoxBorder

      if (this.isPlaying) {
        if (this.originalGrid[i][j] == 0 && this.grid[i][j] != 0) {
          style.color = this.colors.input
        }
      }

      if (i%3 == 0) {
        style.borderTopWidth = width;
        style.borderBottomColor = color;
      }
      if (i%3 == 1) {
        style.borderTop = '0';
        style.borderBottom = '0';
      }
      if (i%3 == 2) {
        style.borderTopColor = color;
        if (i == 8)
          style.borderBottomWidth = width;
        else
          style.borderBottom = '0';
      }

      if (j%3 == 0) {
        style.borderLeftWidth = width;
        style.borderRightColor = color;
      }
      if (j%3 == 1) {
        style.borderLeft = '0';
        style.borderRight = '0';
      }
      if (j%3 == 2) {
        style.borderLeftColor = color;
        if (j == 8)
          style.borderRightWidth = width;
        else
          style.borderRight = '0';
      }

      style.backgroundColor = this.main_box_color[i][j]

      return style;
    },
    mainBoxClick(i, j) {
      if (this.isPlaying) {
        this.main_box_color = JSON.parse(JSON.stringify(this.color_null))
  
        this.doRegionHighlight(i, j)
        this.doSameNumberHighlight(i, j)
        
        this.selectedBox = null
        this.calculateWrong()

        this.colorHintedCells()
  
        this.main_box_color[i][j] = this.colors.clickedBox        
        this.selectedBox = [i, j]
        this.gridKey++
      }
    },
    removeMainBoxColor () {
      if (this.isPlaying && !this.numBoxClicked) {
        this.main_box_color = JSON.parse(JSON.stringify(this.color_null))
        this.selectedBox = null
        this.calculateWrong()
        this.colorHintedCells()
        this.gridKey++
      }
      this.numBoxClicked = false
    },
    getMainBoxNumber(i, j) {
      if (this.grid[i][j] != 0)
        return this.grid[i][j]
    },
    numBoxClick(i, j) {
      this.numBoxClicked = true
      let number = i*3 + j + 1

      if (this.isPlaying && this.selectedBox != null && this.originalGrid[this.selectedBox[0]][this.selectedBox[1]] == 0 && !this.isCellHinted(this.selectedBox[0], this.selectedBox[1])) {
        if (this.notesOnOff == 'on') {
          if (this.grid[this.selectedBox[0]][this.selectedBox[1]] == 0) {
            if (this.notesGrid[this.selectedBox[0]][this.selectedBox[1]].includes(number))
              this.notesGrid[this.selectedBox[0]][this.selectedBox[1]] = this.notesGrid[this.selectedBox[0]][this.selectedBox[1]].filter(i => i != number);
            else
              this.notesGrid[this.selectedBox[0]][this.selectedBox[1]].push(number)
          }
        }
        else {
          if (this.grid[this.selectedBox[0]][this.selectedBox[1]] != 0) {
            this.remainingNumbers[this.grid[this.selectedBox[0]][this.selectedBox[1]]] += 1
          }
  
          this.grid[this.selectedBox[0]][this.selectedBox[1]] = number
          this.notesGrid[this.selectedBox[0]][this.selectedBox[1]] = []
          this.main_box_color = JSON.parse(JSON.stringify(this.color_null))
          
          this.doRegionHighlight(this.selectedBox[0], this.selectedBox[1])
          this.doSameNumberHighlight(this.selectedBox[0], this.selectedBox[1])
          let isWrong = this.calculateWrong()
          this.colorHintedCells()
  
          this.remainingNumbers[number] -= 1
          this.calculateNumBoxDisable()
  
          if (this.isGridFull() && !isWrong) {
            this.main_box_color = Array.from({ length: 9 }, () => Array(9).fill(this.colors.victory))
            this.stopTimer()
            this.isPlaying = false
          }
        }

        this.gridKey++
      }
    },
    calculateWrong() {
      let wrong = false
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (this.grid[i][j] != 0 && this.originalGrid[i][j] == 0) {
            let cellCheck = false
            for (let k = 0; k < 3; k++) {
              for (let t = 0; t < 3; t++) {
                if (this.grid[i][j] == this.grid[parseInt(i/3)*3+k][parseInt(j/3)*3+t] && parseInt(i/3)*3+k != i && parseInt(j/3)*3+t != j) {
                  this.main_box_color[parseInt(i/3)*3+k][parseInt(j/3)*3+t] = this.colors.wrongBackground
                  wrong = true
                  cellCheck = true
                }
              }
            }
            for (let k = 0; k < 9; k++) {
              if (this.grid[i][j] == this.grid[k][j] && i != k) {
                this.main_box_color[k][j] = this.colors.wrongBackground
                wrong = true
                cellCheck = true
              }
            }
            for (let k = 0; k < 9; k++) {
              if (this.grid[i][j] == this.grid[i][k] && j != k) {
                this.main_box_color[i][k] = this.colors.wrongBackground
                wrong = true
                cellCheck = true
              }
            }

            if (cellCheck) {
              this.main_box_color[i][j] = this.colors.wrongBackground
              if (this.selectedBox != null && this.selectedBox[0] == i && this.selectedBox[1] == j) {
                this.mistakeCount++
                if (this.setting.mistake[2] == 'mdi-toggle-switch' && this.mistakeCount >= 3)
                  this.gameOver()
              }
            }
          }
        }
      }
      
      return wrong
    },
    settingChange(item) {
      if (this.setting[item][2] == 'mdi-toggle-switch-off') {
        this.setting[item][2] = 'mdi-toggle-switch'
        this.setting[item][3] = '#4FC3F7'
      }
      else {
        this.setting[item][2] = 'mdi-toggle-switch-off'
        this.setting[item][3] = ''
      }

      localStorage.setItem('setting', JSON.stringify(this.setting))
      this.settingKey++
    },
    isGridFull() {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (this.grid[i][j] == 0)
            return false
        }
      }
      return true
    },
    getRemainingNumbers(number) {
      if (this.isPlaying) {
        if (this.remainingNumbers[number] != 0)
          return this.remainingNumbers[number]
      }
    },
    doRegionHighlight(i, j) {
      if (this.setting.regionHighlight[2] == 'mdi-toggle-switch') {
        for (let k = 0; k < 3; k++) {
          for (let t = 0; t < 3; t++) {
            this.main_box_color[parseInt(i/3)*3+k][parseInt(j/3)*3+t] = this.colors.clickedBoxExtra
          } 
        }
        for (let k = 0; k < 9; k++) {
          this.main_box_color[k][j] = this.colors.clickedBoxExtra
        }
        for (let k = 0; k < 9; k++) {
          this.main_box_color[i][k] = this.colors.clickedBoxExtra
        }
      }
    },
    doSameNumberHighlight(i, j) {
      if (this.grid[i][j] != 0 && this.setting.sameNumberHighlight[2] == 'mdi-toggle-switch') {
        for (let k = 0; k < 9; k++) {
          for (let t = 0; t < 9; t++) {
            if (this.grid[i][j] == this.grid[k][t])
              this.main_box_color[k][t] = this.colors.clickedBoxSameNumber
          } 
        }
      }
    },
    calculateNumBoxDisable() {
      this.numBoxDisable = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
      }

      for (let i = 1; i < 10; i++) {
        if (this.remainingNumbers[i] == 0)
          this.numBoxDisable[i] = true
      }
    },
    eraseClick() {
      if (this.isPlaying && this.selectedBox != null) {
        if (this.grid[this.selectedBox[0]][this.selectedBox[1]] != 0 && this.originalGrid[this.selectedBox[0]][this.selectedBox[1]] == 0 && !this.isCellHinted(this.selectedBox[0], this.selectedBox[1])) {
          this.remainingNumbers[this.grid[this.selectedBox[0]][this.selectedBox[1]]] += 1
          this.calculateNumBoxDisable()
          this.grid[this.selectedBox[0]][this.selectedBox[1]] = 0
          this.gridKey++
        }
        this.notesGrid[this.selectedBox[0]][this.selectedBox[1]] = []
      }
    },
    getNotesCircleStyle() {
      if (this.notesOnOff == 'on') {
        return {backgroundColor: '#2962FF'}
      }
      return {backgroundColor: '#616161'}
    },
    notesClick() {
      if (this.isPlaying) {
        this.numBoxClicked = true
        if (this.notesOnOff == 'on')
          this.notesOnOff = 'off'
        else
          this.notesOnOff = 'on'
      }
    },
    hintClick() {
      if (this.isPlaying && this.hintNumber != 0 && !this.isGridFull()) {
        this.hintNumber -= 1

        let i = Math.floor(Math.random() * 9)
        let j = Math.floor(Math.random() * 9)
        while (this.grid[i][j] != 0) {
          i = Math.floor(Math.random() * 9)
          j = Math.floor(Math.random() * 9)
        }
        
        this.grid[i][j] = this.solutionGrid[i][j]
        this.hintedCells.push([i, j])
        this.remainingNumbers[this.solutionGrid[i][j]] -= 1
        this.calculateNumBoxDisable()
        this.selectedBox = null
        let isWrong = this.calculateWrong()

        if (this.isGridFull() && !isWrong) {
          this.main_box_color = Array.from({ length: 9 }, () => Array(9).fill(this.colors.victory))
          this.stopTimer()
          this.isPlaying = false
        }

        this.gridKey++
      }
    },
    getHintStyle() {
      if (this.hintNumber == 0) {
        return {color: '#9E9E9E'}
      }
    },
    colorHintedCells() {
      this.hintedCells.forEach((cell) => {
        this.main_box_color[cell[0]][cell[1]] = this.colors.hint
      })
    },
    isCellHinted(i, j) {
      let check = false
      this.hintedCells.forEach((cell) => {
        if (cell[0] == i && cell[1] == j)
          check = true
      })
      return check
    },
    startTimer() {
      if (this.timer) return;
      this.timer = setInterval(() => {
        if (this.setting.mistake[2] == 'mdi-toggle-switch' && this.mistakeCount >= 3)
          this.gameOver()

        let Stmp = parseInt(this.time.second) + 1
        if (Stmp == 60) {
          this.time.second = '00'
          let Mtmp = parseInt(this.time.minute) + 1
          if (Mtmp < 10)
            this.time.minute = '0' + Mtmp.toString()
          else
            this.time.minute = Mtmp.toString()
        }
        else {
          if (Stmp < 10)
            this.time.second = '0' + Stmp.toString()
          else
            this.time.second = Stmp.toString()
        }

      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
    },
    resetTimer() {
      this.stopTimer();
      this.time = {minute: '00', second: '00'};
    },
    gameOver() {
      this.isPlaying = false
      this.stopTimer()
      this.isGameOver = true
    },
    restart() {
      this.grid = JSON.parse(JSON.stringify(this.originalGrid))
      this.main_box_color = JSON.parse(JSON.stringify(this.color_null))
      this.remainingNumbers = {
        1: 9,
        2: 9,
        3: 9,
        4: 9,
        5: 9,
        6: 9,
        7: 9,
        8: 9,
        9: 9,
      }
      this.numBoxDisable = {
        1: false,
        2: false,
        3: false,
        4: false,
        5: false,
        6: false,
        7: false,
        8: false,
        9: false,
      }
      this.hintNumber = 3
      this.hintedCells = []
      this.notesOnOff = 'off'
      this.notesGrid = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []))
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          this.remainingNumbers[this.grid[i][j]] -= 1
        } 
      }
      for (let i = 1; i < 10; i++) {
        if (this.remainingNumbers[i] == 0)
          this.numBoxDisable[i] = true
      }
      this.mistakeCount = 0
      this.isGameOver = false

      this.resetTimer()
      this.startTimer()

      this.isPlaying = true
    },
    handleKeyDown(event) {
      if (['n', 'N', 'د'].includes(event.key))
        this.notesClick()
      if (['Delete', 'Backspace'].includes(event.key)) {
        this.eraseClick()
        this.removeMainBoxColor()
      }
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(event.key)) {
        let number = parseInt(event.key)
        let i = parseInt((number-1) / 3)
        let j = number - (i*3) - 1
        this.numBoxClick(i, j)
        this.removeMainBoxColor()
      }
    },
    numBoxRightClick(i, j) {
      this.numBoxClicked = true
      let number = i*3 + j + 1

      if (this.isPlaying && this.selectedBox != null && this.originalGrid[this.selectedBox[0]][this.selectedBox[1]] == 0 && !this.isCellHinted(this.selectedBox[0], this.selectedBox[1])) {
        if (this.grid[this.selectedBox[0]][this.selectedBox[1]] == 0) {
          if (this.notesGrid[this.selectedBox[0]][this.selectedBox[1]].includes(number))
            this.notesGrid[this.selectedBox[0]][this.selectedBox[1]] = this.notesGrid[this.selectedBox[0]][this.selectedBox[1]].filter(i => i != number);
          else
            this.notesGrid[this.selectedBox[0]][this.selectedBox[1]].push(number)
        }

        this.gridKey++
      }
    }
  }
};
</script>

<style>
* {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  user-select: none;
}
.flex_row {
  display: flex;
  justify-content: center;
  align-items: center;
}
.flex_col {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.main_row {
  width: 450px;
  height: 50px;
}
.main_col {
  padding: 0;
  width: 50px !important;
  height: 50px;
}
.main_box {
  padding: 0 !important;
  height: 50px !important;
  width: 50px !important;
  min-width: 50px !important;
  border-radius: 0;
  font-size: 25px !important;
}
.main_box_note {
  padding: 0 !important;
  height: 50px !important;
  width: 50px !important;
  min-width: 50px !important;
  border-radius: 0;
  font-size: 10px !important;
  /* color: #000 !important; */
}
.num_col {
  padding: 0;
  width: 90px !important;
  height: 90px;
}
.num_box {
  padding: 0 !important;
  margin: 0 !important;
  height: 80px !important;
  width: 80px !important;
  min-width: 80px !important;
  font-size: 50px !important;
  color: #2962FF !important;
}
.new_game_btn {
  width: 260px;
  height: 70px !important;
  font-size: 30px !important;
  margin-top: 15px;
  margin-right: 9px;
  color: white !important;
}
.circle_btn {
  margin: 0px 10px 10px 10px;
  height: 56px !important;
  width: 56px !important;
  min-width: 0px !important;
  color: inherit !important;
}
.circle_txt {
  margin-bottom: 30px;
  text-align: center;
}
.difficulty_select {
  width: 115px !important;
  max-width: 115px !important;
}
.v-snack__content {
  text-align: center;
  font-size: 20px;
}
.v-text-field__details {
  display: none;
}
.circle_hint {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2962FF;
  color: #FFF;
  font-size: 16px;
  position: absolute;
  z-index: 1;
  margin-right: 8px;
}
.circle_notes {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #FFF;
  font-size: 12px;
  position: absolute;
  z-index: 1;
  margin-right: 8px;
}
.game_over_title {
  font-weight: 900;
  font-size: 24px;
  text-align: center;
  padding: 15px;
}
.game_over_text {
  width: 250px;
  text-align: center;
  margin-top: 5px;
}
</style>