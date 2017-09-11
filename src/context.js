
export class TestContext {
  constructor (env) {
    this.env = env
    this.propertyDepth = 0
    this.matchSetDepth = -1
  }
}
