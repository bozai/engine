import { IClone } from "./IClone";
import { MathUtil } from "./MathUtil";
import { Matrix3x3 } from "./Matrix3x3";
import { Vector3 } from "./Vector3";

/**
 * Represents a four dimensional mathematical quaternion.
 */
export class Quaternion implements IClone {
  /** @internal */
  static readonly _tempVector3 = new Vector3();
  /** @internal */
  static readonly _tempQuat1 = new Quaternion();

  /**
   * Determines the sum of two quaternions.
   * @param left - The first quaternion to add
   * @param right - The second quaternion to add
   * @param out - The sum of two quaternions
   */
  static add(left: Quaternion, right: Quaternion, out: Quaternion): void {
    out.x = left.x + right.x;
    out.y = left.y + right.y;
    out.z = left.z + right.z;
    out.w = left.w + right.w;
  }

  /**
   * Determines the product of two quaternions.
   * @param left - The first quaternion to multiply
   * @param right - The second quaternion to multiply
   * @param out - The product of two quaternions
   */
  static multiply(left: Quaternion, right: Quaternion, out: Quaternion): void {
    const ax = left.x,
      ay = left.y,
      az = left.z,
      aw = left.w;
    const bx = right.x,
      by = right.y,
      bz = right.z,
      bw = right.w;

    out.x = ax * bw + aw * bx + ay * bz - az * by;
    out.y = ay * bw + aw * by + az * bx - ax * bz;
    out.z = az * bw + aw * bz + ax * by - ay * bx;
    out.w = aw * bw - ax * bx - ay * by - az * bz;
  }

  /**
   * Calculate quaternion that contains conjugated version of the specified quaternion.
   * @param a - The specified quaternion
   * @param out - The conjugate version of the specified quaternion
   */
  static conjugate(a: Quaternion, out: Quaternion): void {
    out.x = -a.x;
    out.y = -a.y;
    out.z = -a.z;
    out.w = a.w;
  }

  /**
   * Determines the dot product of two quaternions.
   * @param left - The first quaternion to dot
   * @param right - The second quaternion to dot
   * @returns The dot product of two quaternions
   */
  static dot(left: Quaternion, right: Quaternion): number {
    return left.x * right.x + left.y * right.y + left.z * right.z + left.w * right.w;
  }

  /**
   * Determines whether the specified quaternions are equals.
   * @param left - The first quaternion to compare
   * @param right - The second quaternion to compare
   * @returns True if the specified quaternions are equals, false otherwise
   */
  static equals(left: Quaternion, right: Quaternion): boolean {
    return (
      MathUtil.equals(left.x, right.x) &&
      MathUtil.equals(left.y, right.y) &&
      MathUtil.equals(left.z, right.z) &&
      MathUtil.equals(left.w, right.w)
    );
  }

  /**
   * Calculate a quaternion rotates around an arbitrary axis.
   * @param axis - The axis
   * @param rad - The rotation angle in radians
   * @param out - The quaternion after rotate
   */
  static rotationAxisAngle(axis: Vector3, rad: number, out: Quaternion): void {
    const normalAxis = Quaternion._tempVector3;
    Vector3.normalize(axis, normalAxis);
    rad *= 0.5;
    const s = Math.sin(rad);
    out.x = normalAxis.x * s;
    out.y = normalAxis.y * s;
    out.z = normalAxis.z * s;
    out.w = Math.cos(rad);
  }

  /**
   * Calculate a quaternion rotates around x, y, z axis (pitch/yaw/roll).
   * @param x - The radian of rotation around X (pitch)
   * @param y - The radian of rotation around Y (yaw)
   * @param z - The radian of rotation around Z (roll)
   * @param out - The calculated quaternion
   */
  static rotationEuler(x: number, y: number, z: number, out: Quaternion): void {
    Quaternion.rotationYawPitchRoll(y, x, z, out);
  }

  /**
   * Calculate a quaternion from the specified yaw, pitch and roll angles.
   * @param yaw - Yaw around the y axis in radians
   * @param pitch - Pitch around the x axis in radians
   * @param roll - Roll around the z axis in radians
   * @param out - The calculated quaternion
   */
  static rotationYawPitchRoll(yaw: number, pitch: number, roll: number, out: Quaternion): void {
    const halfRoll = roll * 0.5;
    const halfPitch = pitch * 0.5;
    const halfYaw = yaw * 0.5;

    const sinRoll = Math.sin(halfRoll);
    const cosRoll = Math.cos(halfRoll);
    const sinPitch = Math.sin(halfPitch);
    const cosPitch = Math.cos(halfPitch);
    const sinYaw = Math.sin(halfYaw);
    const cosYaw = Math.cos(halfYaw);

    const cosYawPitch = cosYaw * cosPitch;
    const sinYawPitch = sinYaw * sinPitch;

    out.x = cosYaw * sinPitch * cosRoll + sinYaw * cosPitch * sinRoll;
    out.y = sinYaw * cosPitch * cosRoll - cosYaw * sinPitch * sinRoll;
    out.z = cosYawPitch * sinRoll - sinYawPitch * cosRoll;
    out.w = cosYawPitch * cosRoll + sinYawPitch * sinRoll;
  }

  /**
   * Calculate a quaternion from the specified 3x3 matrix.
   * @param m - The specified 3x3 matrix
   * @param out - The calculated quaternion
   */
  static rotationMatrix3x3(m: Matrix3x3, out: Quaternion): void {
    const me = m.elements;
    const m11 = me[0],
      m12 = me[1],
      m13 = me[2];
    const m21 = me[3],
      m22 = me[4],
      m23 = me[5];
    const m31 = me[6],
      m32 = me[7],
      m33 = me[8];
    const scale = m11 + m22 + m33;
    let sqrt, half;

    if (scale > 0) {
      sqrt = Math.sqrt(scale + 1.0);
      out.w = sqrt * 0.5;
      sqrt = 0.5 / sqrt;

      out.x = (m23 - m32) * sqrt;
      out.y = (m31 - m13) * sqrt;
      out.z = (m12 - m21) * sqrt;
    } else if (m11 >= m22 && m11 >= m33) {
      sqrt = Math.sqrt(1.0 + m11 - m22 - m33);
      half = 0.5 / sqrt;

      out.x = 0.5 * sqrt;
      out.y = (m12 + m21) * half;
      out.z = (m13 + m31) * half;
      out.w = (m23 - m32) * half;
    } else if (m22 > m33) {
      sqrt = Math.sqrt(1.0 + m22 - m11 - m33);
      half = 0.5 / sqrt;

      out.x = (m21 + m12) * half;
      out.y = 0.5 * sqrt;
      out.z = (m32 + m23) * half;
      out.w = (m31 - m13) * half;
    } else {
      sqrt = Math.sqrt(1.0 + m33 - m11 - m22);
      half = 0.5 / sqrt;

      out.x = (m13 + m31) * half;
      out.y = (m23 + m32) * half;
      out.z = 0.5 * sqrt;
      out.w = (m12 - m21) * half;
    }
  }

  /**
   * Calculate the inverse of the specified quaternion.
   * @param a - The quaternion whose inverse is to be calculated
   * @param out - The inverse of the specified quaternion
   */
  static invert(a: Quaternion, out: Quaternion): void {
    const { x, y, z, w } = a;
    const dot = x * x + y * y + z * z + w * w;
    if (dot > MathUtil.zeroTolerance) {
      const invDot = 1.0 / dot;
      out.x = -x * invDot;
      out.y = -y * invDot;
      out.z = -z * invDot;
      out.w = w * invDot;
    }
  }

  /**
   * Performs a linear blend between two quaternions.
   * @param start - The first quaternion
   * @param end - The second quaternion
   * @param t - The blend amount where 0 returns start and 1 end
   * @param out - The result of linear blending between two quaternions
   */
  static lerp(start: Quaternion, end: Quaternion, t: number, out: Quaternion): void {
    const inv = 1.0 - t;
    if (Quaternion.dot(start, end) >= 0) {
      out.x = start.x * inv + end.x * t;
      out.y = start.y * inv + end.y * t;
      out.z = start.z * inv + end.z * t;
      out.w = start.w * inv + end.w * t;
    } else {
      out.x = start.x * inv - end.x * t;
      out.y = start.y * inv - end.y * t;
      out.z = start.z * inv - end.z * t;
      out.w = start.w * inv - end.w * t;
    }

    out.normalize();
  }

  /**
   * Performs a spherical linear blend between two quaternions.
   * @param start - The first quaternion
   * @param end - The second quaternion
   * @param t - The blend amount where 0 returns start and 1 end
   * @param out - The result of spherical linear blending between two quaternions
   */
  static slerp(start: Quaternion, end: Quaternion, t: number, out: Quaternion): void {
    const ax = start.x;
    const ay = start.y;
    const az = start.z;
    const aw = start.w;
    let bx = end.x;
    let by = end.y;
    let bz = end.z;
    let bw = end.w;

    let scale0, scale1;
    // calc cosine
    let cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    // calculate coefficients
    if (1.0 - cosom > MathUtil.zeroTolerance) {
      // standard case (slerp)
      const omega = Math.acos(cosom);
      const sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t;
      scale1 = t;
    }
    // calculate final values
    out.x = scale0 * ax + scale1 * bx;
    out.y = scale0 * ay + scale1 * by;
    out.z = scale0 * az + scale1 * bz;
    out.w = scale0 * aw + scale1 * bw;
  }

  /**
   * Scales the specified quaternion magnitude to unit length.
   * @param a - The specified quaternion
   * @param out - The normalized quaternion
   */
  static normalize(a: Quaternion, out: Quaternion): void {
    const { x, y, z, w } = a;
    let len: number = Math.sqrt(x * x + y * y + z * z + w * w);
    if (len > MathUtil.zeroTolerance) {
      len = 1 / len;
      out.x = x * len;
      out.y = y * len;
      out.z = z * len;
      out.w = w * len;
    }
  }

  /**
   * Calculate a quaternion rotate around X axis.
   * @param rad - The rotation angle in radians
   * @param out - The calculated quaternion
   */
  static rotationX(rad: number, out: Quaternion): void {
    rad *= 0.5;
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    out.x = s;
    out.y = 0;
    out.z = 0;
    out.w = c;
  }

  /**
   * Calculate a quaternion rotate around Y axis.
   * @param rad - The rotation angle in radians
   * @param out - The calculated quaternion
   */
  static rotationY(rad: number, out: Quaternion): void {
    rad *= 0.5;
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    out.x = 0;
    out.y = s;
    out.z = 0;
    out.w = c;
  }

  /**
   * Calculate a quaternion rotate around Z axis.
   * @param rad - The rotation angle in radians
   * @param out - The calculated quaternion
   */
  static rotationZ(rad: number, out: Quaternion): void {
    rad *= 0.5;
    const s = Math.sin(rad);
    const c = Math.cos(rad);

    out.x = 0;
    out.y = 0;
    out.z = s;
    out.w = c;
  }

  /**
   * Calculate a quaternion that the specified quaternion rotate around X axis.
   * @param quaternion - The specified quaternion
   * @param rad - The rotation angle in radians
   * @param out - The calculated quaternion
   */
  static rotateX(quaternion: Quaternion, rad: number, out: Quaternion): void {
    const { x, y, z, w } = quaternion;
    rad *= 0.5;
    const bx = Math.sin(rad);
    const bw = Math.cos(rad);

    out.x = x * bw + w * bx;
    out.y = y * bw + z * bx;
    out.z = z * bw - y * bx;
    out.w = w * bw - x * bx;
  }

  /**
   * Calculate a quaternion that the specified quaternion rotate around Y axis.
   * @param quaternion - The specified quaternion
   * @param rad - The rotation angle in radians
   * @param out - The calculated quaternion
   */
  static rotateY(quaternion: Quaternion, rad: number, out: Quaternion): void {
    const { x, y, z, w } = quaternion;
    rad *= 0.5;
    const by = Math.sin(rad);
    const bw = Math.cos(rad);

    out.x = x * bw - z * by;
    out.y = y * bw + w * by;
    out.z = z * bw + x * by;
    out.w = w * bw - y * by;
  }

  /**
   * Calculate a quaternion that the specified quaternion rotate around Z axis.
   * @param quaternion - The specified quaternion
   * @param rad - The rotation angle in radians
   * @param out - The calculated quaternion
   */
  static rotateZ(quaternion: Quaternion, rad: number, out: Quaternion): void {
    const { x, y, z, w } = quaternion;
    rad *= 0.5;
    const bz = Math.sin(rad);
    const bw = Math.cos(rad);

    out.x = x * bw + y * bz;
    out.y = y * bw - x * bz;
    out.z = z * bw + w * bz;
    out.w = w * bw - z * bz;
  }

  /**
   * Scale a quaternion by a given number.
   * @param a - The quaternion
   * @param s - The given number
   * @param out - The scaled quaternion
   */
  static scale(a: Quaternion, s: number, out: Quaternion): void {
    out.x = a.x * s;
    out.y = a.y * s;
    out.z = a.z * s;
    out.w = a.w * s;
  }

  /** The x component of the quaternion. */
  x: number;
  /** The y component of the quaternion. */
  y: number;
  /** The z component of the quaternion. */
  z: number;
  /** The w component of the quaternion. */
  w: number;

  /**
   * Constructor of Quaternion.
   * @param x - The x component of the quaternion, default 0
   * @param y - The y component of the quaternion, default 0
   * @param z - The z component of the quaternion, default 0
   * @param w - The w component of the quaternion, default 1
   */
  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Set the value of this quaternion, and return this quaternion.
   * @param x - The x component of the quaternion
   * @param y - The y component of the quaternion
   * @param z - The z component of the quaternion
   * @param w - The w component of the quaternion
   * @returns This quaternion
   */
  setValue(x: number, y: number, z: number, w: number): Quaternion {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    return this;
  }

  /**
   * Set the value of this quaternion by an array.
   * @param array - The array
   * @param offset - The start offset of the array
   * @returns This quaternion
   */
  setValueByArray(array: ArrayLike<number>, offset: number = 0): Quaternion {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];
    return this;
  }

  /**
   * Transforms this quaternion into its conjugated version.
   * @returns This quaternion
   */
  conjugate(): Quaternion {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;

    return this;
  }

  /**
   * Get the rotation axis and rotation angle of the quaternion (unit: radians).
   * @param out - The axis as an output parameter
   * @returns The rotation angle (unit: radians)
   */
  getAxisAngle(out: Vector3): number {
    const { x, y, z } = this;
    const length = x * x + y * y + z * z;

    if (length < MathUtil.zeroTolerance) {
      out.x = 1;
      out.y = 0;
      out.z = 0;

      return 0;
    } else {
      const inv = 1.0 / length;
      out.x = this.x * inv;
      out.y = this.y * inv;
      out.z = this.z * inv;

      return Math.acos(this.w) * 2.0;
    }
  }

  /**
   * Identity this quaternion.
   * @returns This quaternion after identity
   */
  identity(): Quaternion {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.w = 1;
    return this;
  }

  /**
   * Calculate the length of this quaternion.
   * @returns The length of this quaternion
   */
  length(): number {
    const { x, y, z, w } = this;
    return Math.sqrt(x * x + y * y + z * z + w * w);
  }

  /**
   * Calculates the squared length of this quaternion.
   * @returns The squared length of this quaternion
   */
  lengthSquared(): number {
    const { x, y, z, w } = this;
    return x * x + y * y + z * z + w * w;
  }

  /**
   * Converts this quaternion into a unit quaternion.
   * @returns This quaternion
   */
  normalize(): Quaternion {
    Quaternion.normalize(this, this);
    return this;
  }

  /**
   * Get the euler of this quaternion.
   * @param out - The euler (in radians) as an output parameter
   * @returns Euler x->pitch y->yaw z->roll
   */
  toEuler(out: Vector3): Vector3 {
    this.toYawPitchRoll(out);
    const t = out.x;
    out.x = out.y;
    out.y = t;
    return out;
  }

  /**
   * Get the euler of this quaternion.
   * @param out - The euler (in radians) as an output parameter
   * @returns Euler x->yaw y->pitch z->roll
   */
  toYawPitchRoll(out: Vector3): Vector3 {
    const { x, y, z, w } = this;
    const xx = x * x;
    const yy = y * y;
    const zz = z * z;
    const xy = x * y;
    const zw = z * w;
    const zx = z * x;
    const yw = y * w;
    const yz = y * z;
    const xw = x * w;

    out.y = Math.asin(2.0 * (xw - yz));
    if (Math.cos(out.y) > MathUtil.zeroTolerance) {
      out.z = Math.atan2(2.0 * (xy + zw), 1.0 - 2.0 * (zz + xx));
      out.x = Math.atan2(2.0 * (zx + yw), 1.0 - 2.0 * (yy + xx));
    } else {
      out.z = Math.atan2(-2.0 * (xy - zw), 1.0 - 2.0 * (yy + zz));
      out.x = 0.0;
    }

    return out;
  }

  /**
   * Clone the value of this quaternion to an array.
   * @param out - The array
   * @param outOffset - The start offset of the array
   */
  toArray(out: number[] | Float32Array | Float64Array, outOffset: number = 0) {
    out[outOffset] = this.x;
    out[outOffset + 1] = this.y;
    out[outOffset + 2] = this.z;
    out[outOffset + 3] = this.w;
  }

  /**
   * Creates a clone of this quaternion.
   * @returns A clone of this quaternion
   */
  clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Clones this quaternion to the specified quaternion.
   * @param out - The specified quaternion
   * @returns The specified quaternion
   */
  cloneTo(out: Quaternion): Quaternion {
    out.x = this.x;
    out.y = this.y;
    out.z = this.z;
    out.w = this.w;
    return out;
  }

  /**
   * Calculate this quaternion rotate around X axis.
   * @param rad - The rotation angle in radians
   * @returns This quaternion
   */
  rotateX(rad: number): Quaternion {
    Quaternion.rotateX(this, rad, this);
    return this;
  }

  /**
   * Calculate this quaternion rotate around Y axis.
   * @param rad - The rotation angle in radians
   * @returns This quaternion
   */
  rotateY(rad: number): Quaternion {
    Quaternion.rotateY(this, rad, this);
    return this;
  }

  /**
   * Calculate this quaternion rotate around Z axis.
   * @param rad - The rotation angle in radians
   * @returns This quaternion
   */
  rotateZ(rad: number): Quaternion {
    Quaternion.rotateZ(this, rad, this);
    return this;
  }

  /**
   * Calculate this quaternion rotates around an arbitrary axis.
   * @param axis - The axis
   * @param rad - The rotation angle in radians
   * @returns This quaternion
   */
  rotationAxisAngle(axis: Vector3, rad: number): Quaternion {
    Quaternion.rotationAxisAngle(axis, rad, this);
    return this;
  }

  /**
   * Determines the product of this quaternion and the specified quaternion.
   * @param quat - The specified quaternion
   * @returns The product of the two quaternions
   */
  multiply(quat: Quaternion): Quaternion {
    Quaternion.multiply(this, quat, this);
    return this;
  }

  /**
   * Invert this quaternion.
   * @returns This quaternion after invert
   */
  invert(): Quaternion {
    Quaternion.invert(this, this);
    return this;
  }

  /**
   * Determines the dot product of this quaternion and the specified quaternion.
   * @param quat - The specified quaternion
   * @returns The dot product of two quaternions
   */
  dot(quat: Quaternion): number {
    return Quaternion.dot(this, quat);
  }

  /**
   * Performs a linear blend between this quaternion and the specified quaternion.
   * @param quat - The specified quaternion
   * @param t - The blend amount where 0 returns this and 1 quat
   * @returns - The result of linear blending between two quaternions
   */
  lerp(quat: Quaternion, t: number): Quaternion {
    Quaternion.lerp(this, quat, t, this);
    return this;
  }

  /**
   * Calculate this quaternion rotation around an arbitrary axis.
   * @param axis - The axis
   * @param rad - The rotation angle in radians
   * @returns This quaternion
   */
  rotateAxisAngle(axis: Vector3, rad: number): Quaternion {
    Quaternion._tempQuat1.rotationAxisAngle(axis, rad);
    this.multiply(Quaternion._tempQuat1);
    return this;
  }
}
