import Phaser from 'phaser'
import {
  ELEVATOR_CABIN_FRAMES,
  ELEVATOR_CABIN_TEXTURE_KEY,
  ELEVATOR_DOOR_APERTURE,
} from '../art/elevatorArt'
import { LAB_WIDTH } from '../dimensions'

export class ElevatorCabin {
  readonly shell: Phaser.GameObjects.Container
  readonly leftDoor: Phaser.GameObjects.Container
  readonly rightDoor: Phaser.GameObjects.Container
  readonly ambientLight: Phaser.GameObjects.Container
  readonly ceilingLight: Phaser.GameObjects.Rectangle

  constructor(private readonly scene: Phaser.Scene) {
    const { x, y, width, height } = ELEVATOR_DOOR_APERTURE
    const center = x + width / 2

    this.shell = scene.add.container(0, 0, [
      this.createFrame(ELEVATOR_CABIN_FRAMES.shellTop),
      this.createFrame(ELEVATOR_CABIN_FRAMES.shellLeft),
      this.createFrame(ELEVATOR_CABIN_FRAMES.shellRight),
      this.createFrame(ELEVATOR_CABIN_FRAMES.shellFloor),
    ]).setDepth(2)

    const leftImage = this.createFrame(ELEVATOR_CABIN_FRAMES.doorLeft)
    const rightImage = this.createFrame(ELEVATOR_CABIN_FRAMES.doorRight)
    const leftEdge = scene.add.rectangle(center - 2, y + height / 2, 3, height - 12, 0x5cdfff, 0.14)
    const rightEdge = scene.add.rectangle(center + 2, y + height / 2, 3, height - 12, 0xffc45c, 0.1)

    this.leftDoor = scene.add.container(0, 0, [leftImage, leftEdge]).setDepth(4)
    this.rightDoor = scene.add.container(0, 0, [rightImage, rightEdge]).setDepth(4)

    this.ceilingLight = scene.add.rectangle(LAB_WIDTH / 2, 97, 88, 12, 0x82e9ff, 0.12)
      .setBlendMode(Phaser.BlendModes.ADD)
    const coldPool = scene.add.ellipse(LAB_WIDTH / 2, 240, 500, 330, 0x48c7ef, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
    const floorReflection = scene.add.rectangle(LAB_WIDTH / 2, 478, 190, 30, 0x52dfff, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
    this.ambientLight = scene.add.container(0, 0, [coldPool, floorReflection, this.ceilingLight])
      .setDepth(4.5)
  }

  get motionTargets(): Phaser.GameObjects.GameObject[] {
    return [this.shell, this.leftDoor, this.rightDoor, this.ambientLight]
  }

  get fadeTargets(): Phaser.GameObjects.GameObject[] {
    return [this.shell, this.ambientLight]
  }

  openDoors(duration = 860) {
    const travel = ELEVATOR_DOOR_APERTURE.width / 2 + 16
    this.scene.tweens.add({
      targets: this.leftDoor,
      x: -travel,
      duration,
      ease: 'Quint.easeInOut',
    })
    this.scene.tweens.add({
      targets: this.rightDoor,
      x: travel,
      duration,
      ease: 'Quint.easeInOut',
    })
  }

  private createFrame(frame: (typeof ELEVATOR_CABIN_FRAMES)[keyof typeof ELEVATOR_CABIN_FRAMES]) {
    return this.scene.add.image(frame.x, frame.y, ELEVATOR_CABIN_TEXTURE_KEY, frame.key)
      .setOrigin(0)
  }
}
