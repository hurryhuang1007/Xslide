import React from 'react'
import { getFileTypeByURL, vipsFnPromise, jpgBuffer2ImageAsync } from '../../core'
import { StateCover } from '../StateCover/Index'
const screenSize = global.nodeRequire('electron').screen.getPrimaryDisplay().size

function splitKofTile(KofTile) {
  return KofTile.split('.').map(Number)
}

export default class Viewer extends React.Component {
  static tileSize = 512
  static maxTileCache = 500

  state = {
    inited: false,
    loaded: false,
    error: false
  }

  _inited = false
  _animateId = null
  _changed = false
  _moveActive = false

  _infos = null
  _thumbnail = null
  _thumbnailLevel = null

  _zoom = 1
  // left&top记录的是百分比,而不是像素值
  _left = 0
  _top = 0
  _currentState = null

  _tile = {} // k 以 level.x.y 命名，每块大小为tileSize*tileSize
  _tileKeyList = [] // tile键顺序列表
  _changedTile = []
  _gettingTile = [] // 正在获取中的tile，避免同时获取

  componentDidMount() {
    window.viewer = this
    this._resize()
    this._init(this.props.tilePath)
    this._initListener()
  }

  componentDidUpdate(pp, ps) {
    if (pp.layoutWidth !== this.props.layoutWidth || pp.layoutHeight !== this.props.layoutHeight) this._resize()
    if (pp.tilePath !== this.props.tilePath) {
      this._destroy()
      this.resetPosition()
      this.setState({ inited: false, loaded: false, error: false })
      this._init(this.props.tilePath)
    }
  }

  componentWillUnmount() {
    delete window.viewer
    this._destroyListener()
    this._destroy()
  }

  async _init(tilePath) {
    if (!tilePath || this._inited) return
    // console.time('init')

    this._inited = true
    this.setState({ inited: true })
    try {
      let canvas = this.refs.canvas
      let type = getFileTypeByURL(tilePath)
      if (type === 'png' || type === 'jpg' || type === 'jpeg') {
        let img = new window.Image()
        await new Promise(resolve => {
          img.onload = async () => {
            this._thumbnail = img
            this._thumbnailLevel = 'thumbnail_only'
            this._infos = {
              width: this._thumbnail.width,
              height: this._thumbnail.height,
              k: (canvas.width / canvas.height) / (this._thumbnail.width / this._thumbnail.height) > 1 ? 'height' : 'width'
            }
            resolve()
          }
          img.src = tilePath
        })
      } else {
        // this._infos = JSON.parse(JSON.stringify(await vipsFn.getInfos(tilePath)))
        this._infos = await vipsFnPromise('getInfos', [tilePath])
        this._infos.k = (canvas.width / canvas.height) / (this._infos.width / this._infos.height) > 1 ? 'height' : 'width'
        let k = (screenSize.width / screenSize.height) / (this._infos.width / this._infos.height) > 1 ? 'height' : 'width'
        let downSample = this._infos[k] / screenSize[k]
        let maxLevel = +this._infos['openslide.level-count'] - 1
        if (+this._infos[`openslide.level[${maxLevel}].downsample`] < downSample / 3) {
          // this._thumbnail = await jpgBuffer2BitmapAsync(await vipsFn.getThumbnail(tilePath, this._infos['slide-associated-images'].split(', ').includes('thumbnail') ? {associated: 'thumbnail'} : {level: maxLevel}))
          this._thumbnail = await jpgBuffer2ImageAsync(await vipsFnPromise('getThumbnail', [tilePath, this._infos['slide-associated-images'].split(', ').includes('thumbnail') ? { associated: 'thumbnail' } : { level: maxLevel }]))
          this._thumbnailLevel = 'thumbnail'
        } else {
          this._thumbnailLevel = this._getLevel(downSample, 1.5)
          // this._thumbnail = await jpgBuffer2BitmapAsync(await vipsFn.getImage(tilePath, {level: this._thumbnailLevel}))
          this._thumbnail = await jpgBuffer2ImageAsync(await vipsFnPromise('getImage', [tilePath, { level: this._thumbnailLevel }]))
        }
      }
      this._renderThumbnail()
      this.setState({ loaded: true })
    } catch (e) {
      console.error(e)
      this.setState({ error: e.message })
    }
    // console.timeEnd('init')
  }

  _getLevel(downSample, scale = 1) {
    if (this._thumbnailLevel === 'thumbnail_only') return 'thumbnail_only'
    if (downSample <= 1) return 0
    let k = this._infos.k
    let maxLevel = +this._infos['openslide.level-count'] - 1
    if (this._thumbnailLevel === 'thumbnail' && (this._infos[k] / this._thumbnail[k] < downSample / scale || +this._infos[`openslide.level[${maxLevel}].downsample`] < downSample / scale / 7)) return 'thumbnail'
    for (let i = +this._infos['openslide.level-count'] - 1; i > -1; i--) if (+this._infos[`openslide.level[${i}].downsample`] < downSample / scale) return i
  }

  _renderThumbnail() {
    if (!this._thumbnail) return
    // console.time('renderThumbnail')

    let canvas = this.refs.canvas
    let ctx = canvas.getContext('2d')
    // ctx.resetTransform()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // ctx.transform(...this._transformInfo.mat)
    // ctx.translate(...this._transformInfo.translate)

    // let k = (canvas.width / canvas.height) / (this._thumbnail.width / this._thumbnail.height) > 1 ? 'height' : 'width'
    let k = this._infos.k
    let downSample = this._thumbnail[k] / canvas[k] / this._zoom
    let w = this._thumbnail.width / downSample > canvas.width ? canvas.width * downSample : this._thumbnail.width
    let h = this._thumbnail.height / downSample > canvas.height ? canvas.height * downSample : this._thumbnail.height
    // console.log('width,height', width, height)

    let sx = Math.max((this._thumbnail.width - canvas.width * downSample) / 2 - this._left * this._thumbnail[k], 0)
    let sy = Math.max((this._thumbnail.height - canvas.height * downSample) / 2 - this._top * this._thumbnail[k], 0)
    let dw = w / downSample
    let dh = h / downSample
    let dx = (canvas.width - dw) / 2 + this._thumbnail[k] / downSample * this._left + (sx - (this._thumbnail.width - w) / 2) / downSample
    let dy = (canvas.height - dh) / 2 + this._thumbnail[k] / downSample * this._top + (sy - (this._thumbnail.height - h) / 2) / downSample
    let sw = Math.min((canvas.width - dx) * downSample, w, this._thumbnail.width - sx)
    let sh = Math.min((canvas.height - dy) * downSample, h, this._thumbnail.height - sy)
    dw = sw / downSample
    dh = sh / downSample

    // https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/drawImage
    ctx.drawImage(this._thumbnail, sx, sy, sw, sh, dx, dy, dw, dh)
    // console.log(sx, sy, '\n', sw, sh, '\n', dx, dy, '\n', dw, dh)
    // console.timeEnd('renderThumbnail')

    let globalDownSample = this._infos[k] / canvas[k] / this._zoom
    this._currentState = {
      globalDownSample,
      level: this._getLevel(globalDownSample),
      sx: sx / this._thumbnail.width,
      sy: sy / this._thumbnail.height,
      sw: sw / this._thumbnail.width,
      sh: sh / this._thumbnail.height,
      dx,
      dy,
      dw,
      dh
    }
    // console.log(sx / this._thumbnail.width * this._infos.width / globalDownSample - sx / downSample)
  }

  _searchAndRenderTile() {
    if (!this._currentState) return
    let { level, sx, sy, sw, sh } = this._currentState
    if (level >= this._thumbnailLevel) return
    let tileSize = Viewer.tileSize
    let width = this._infos[`openslide.level[${level}].width`]
    let height = this._infos[`openslide.level[${level}].height`]

    let x0 = sx * width
    let x1 = x0 + sw * width
    let y0 = sy * height
    let y1 = y0 + sh * height
    x0 = ~~(x0 / tileSize) * tileSize
    x1 = x1 % tileSize ? ~~(x1 / tileSize) * tileSize : x1 - tileSize
    y0 = ~~(y0 / tileSize) * tileSize
    y1 = y1 % tileSize ? ~~(y1 / tileSize) * tileSize : y1 - tileSize
    // console.log(x0, x1, y0, y1, sx + sw, sy + sh)

    let needRenderTile = []
    let needGetTile = []
    for (let x = x0; x <= x1; x += tileSize) {
      for (let y = y0; y <= y1; y += tileSize) {
        let k = `${level}.${x}.${y}`
        if (this._tile[k]) {
          needRenderTile.push(k)
          let index = this._tileKeyList.indexOf(k)
          if (index !== -1) {
            this._tileKeyList.splice(index, 1)
            this._tileKeyList.push(k)
          }
        } else {
          let { full, keys } = this._searchLowerTile(k)
          keys.forEach(i => needRenderTile.includes(i) ? undefined : needRenderTile.push(i))
          if (!full) {
            needGetTile.push(k)
            let higherTile = this._searchHigherTile(k)
            if (higherTile) higherTile.forEach(i => needRenderTile.includes(i) ? undefined : needRenderTile.unshift(i)) // 因先forEach后unshift，所以插入的顺序会相反
          }
        }
      }
    }
    needRenderTile.forEach(k => this._renderTile(k, false))
    needGetTile.forEach(k => this._getTile(k, this._tile))
    // console.log(needRenderROI, needGetROI)
  }

  _searchLowerTile(KofTile) {
    let [tileLevel, left, top] = splitKofTile(KofTile)
    if (tileLevel === 0) return { full: false, keys: [] }
    let tileSize = Viewer.tileSize
    let level = tileLevel - 1

    let x0 = left / this._infos[`openslide.level[${tileLevel}].width`] * this._infos[`openslide.level[${level}].width`]
    let x1 = (left + tileSize) / this._infos[`openslide.level[${tileLevel}].width`] * this._infos[`openslide.level[${level}].width`]
    let y0 = top / this._infos[`openslide.level[${tileLevel}].height`] * this._infos[`openslide.level[${level}].height`]
    let y1 = (top + tileSize) / this._infos[`openslide.level[${tileLevel}].height`] * this._infos[`openslide.level[${level}].height`]
    x0 = ~~(x0 / tileSize) * tileSize
    x1 = x1 % tileSize ? ~~(x1 / tileSize) * tileSize : x1 - tileSize
    y0 = ~~(y0 / tileSize) * tileSize
    y1 = y1 % tileSize ? ~~(y1 / tileSize) * tileSize : y1 - tileSize

    let tileList = []
    for (let x = x0; x <= x1; x += tileSize) for (let y = y0; y <= y1; y += tileSize) tileList.push(`${level}.${x}.${y}`)
    let keys = tileList.filter(k => this._tile[k])
    return { full: tileList.length === keys.length, keys }
  }

  _searchHigherTile(KofTile) {
    let [tileLevel, left, top] = splitKofTile(KofTile)
    if (tileLevel === +this._infos['openslide.level-count'] - 1 || tileLevel >= +this._thumbnailLevel - 1) return
    let tileSize = Viewer.tileSize
    let level = tileLevel + 1

    let x0 = left / this._infos[`openslide.level[${tileLevel}].width`] * this._infos[`openslide.level[${level}].width`]
    let x1 = (left + tileSize) / this._infos[`openslide.level[${tileLevel}].width`] * this._infos[`openslide.level[${level}].width`]
    let y0 = top / this._infos[`openslide.level[${tileLevel}].height`] * this._infos[`openslide.level[${level}].height`]
    let y1 = (top + tileSize) / this._infos[`openslide.level[${tileLevel}].height`] * this._infos[`openslide.level[${level}].height`]
    x0 = ~~(x0 / tileSize) * tileSize
    x1 = x1 % tileSize ? ~~(x1 / tileSize) * tileSize : x1 - tileSize
    y0 = ~~(y0 / tileSize) * tileSize
    y1 = y1 % tileSize ? ~~(y1 / tileSize) * tileSize : y1 - tileSize

    let tileList = []
    for (let x = x0; x <= x1; x += tileSize) for (let y = y0; y <= y1; y += tileSize) tileList.push(`${level}.${x}.${y}`)
    let result = []
    tileList.forEach(k => {
      if (this._tile[k]) {
        result.push(k)
      } else {
        let tmp = this._searchHigherTile(k)
        if (tmp) result.push(...tmp)
      }
    })
    return result
  }

  async _getTile(KofTile, _tile) {
    if (this._gettingTile.includes(KofTile)) return
    this._gettingTile.push(KofTile)
    let tileSize = Viewer.tileSize
    let [level, left, top] = splitKofTile(KofTile)
    // let ROI = await jpgBuffer2BitmapAsync(await vipsFn.getImage(this.props.tilePath, {level, left, top, width: ROISize, height: ROISize}))
    let tile = await jpgBuffer2ImageAsync(await vipsFnPromise('getImage', [this.props.tilePath, { level, left, top, width: tileSize, height: tileSize }]))
    if (_tile !== this._tile) {
      URL.revokeObjectURL(tile.src)
      return
    }
    _tile[KofTile] = tile
    this._tileKeyList.push(KofTile)
    this._changedTile.push(KofTile)
    this._gettingTile.splice(this._gettingTile.indexOf(KofTile), 1)
    if (this._tileKeyList.length > Viewer.maxTileCache) {
      let k = this._tileKeyList.splice(0, 1)[0]
      URL.revokeObjectURL(_tile[k].src)
      delete _tile[k]
      // console.info('销毁ROI,k:', k)
    }
  }

  _renderTile(KofTile, needCheck = true) {
    let tile = this._tile[KofTile]
    if (!tile) return
    let { globalDownSample, level, sx, sy, sw, sh, dx, dy } = this._currentState
    let [tileLevel, x, y] = splitKofTile(KofTile)
    let width = this._infos[`openslide.level[${tileLevel}].width`]
    let height = this._infos[`openslide.level[${tileLevel}].height`]
    if (needCheck && (tileLevel !== level || x / width >= sx + sw || y / height >= sy + sh || (x + tile.width) / width <= sx || (y + tile.height) / height <= sy)) return
    this.refs.canvas.getContext('2d').drawImage(
      tile,
      dx + (x / width - sx) * this._infos.width / globalDownSample,
      dy + (y / height - sy) * this._infos.height / globalDownSample,
      tile.width / width * this._infos.width / globalDownSample,
      tile.height / height * this._infos.height / globalDownSample
    )
  }

  _destroy() {
    this._inited = false
    this._currentState = null
    this._infos = null

    for (let k in this._tile) URL.revokeObjectURL(this._tile[k].src)
    this._tile = {}
    this._tileKeyList = []

    if (!this._thumbnail) return
    URL.revokeObjectURL(this._thumbnail.src)
    this._thumbnail = null
    this._thumbnailLevel = null
  }

  _initListener() {
    this.refs.mainDOM.addEventListener('wheel', this._wheel)
    this.refs.mainDOM.addEventListener('mousedown', this._mouseDown)
    window.addEventListener('mousemove', this._mouseMove)
    window.addEventListener('mouseup', this._mouseUp)
    this._animate()
  }

  _destroyListener() {
    this.refs.mainDOM.removeEventListener('wheel', this._wheel)
    this.refs.mainDOM.removeEventListener('mousedown', this._mouseDown)
    window.removeEventListener('mousemove', this._mouseMove)
    window.removeEventListener('mouseup', this._mouseUp)
    window.cancelAnimationFrame(this._animateId)
  }

  _wheel = e => {
    e.preventDefault()
    e.stopPropagation()
    if (!this.state.loaded) return

    let diff = this._zoom * 0.1
    e.deltaY > 0 ? this._zoom -= diff : this._zoom += diff
    this._changed = true
  }

  _mouseDown = e => {
    e.preventDefault()
    e.stopPropagation()
    if (!this.state.loaded) return
    if (e.button === 0 || e.buttons === 1) this._moveActive = true
  }

  _mouseMove = e => {
    if (!this.state.loaded) return

    if (this._moveActive) {
      e.preventDefault()
      e.stopPropagation()
      this._left += e.movementX * this._currentState.globalDownSample / this._infos[this._infos.k]
      this._top += e.movementY * this._currentState.globalDownSample / this._infos[this._infos.k]
      this._changed = true
      // console.log('!!!', e.movementX / canvas.width, e.movementY / canvas.height)
    }
  }

  _mouseUp = e => {
    this._moveActive = false
  }

  _animate = () => {
    if (this._changed) {
      this._renderThumbnail()
      this._searchAndRenderTile()
      this._changed = false
      this._changedTile.length = 0
    } else if (this._changedTile.length) {
      this._changedTile.forEach(i => this._renderTile(i))
      this._changedTile.length = 0
    }
    this._animateId = window.requestAnimationFrame(this._animate)
  }

  _resize() {
    let canvas = this.refs.canvas
    let pixelRatio = window.devicePixelRatio
    canvas.width = this.props.layoutWidth * pixelRatio
    canvas.height = this.props.layoutHeight * pixelRatio
    this._changed = true
  }

  resetPosition() {
    this._zoom = 1
    this._left = 0
    this._top = 0
    this._changed = true
  }

  render() {
    return (
      <div ref='mainDOM' style={{ position: 'relative', width: this.props.layoutWidth, height: this.props.layoutHeight }} >
        <canvas ref='canvas' />
        <StateCover {...this.state} />
      </div>
    )
  }
}
