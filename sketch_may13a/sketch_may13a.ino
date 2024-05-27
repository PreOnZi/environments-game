#include <Servo.h>


const int servoPin = 9;

Servo myServo;
int originalPosition = 1500; // Original position

void setup() {

Serial.begin(9600);
 
  myServo.attach(servoPin);

  // Intial Position (1500 microsec.)
  myServo.writeMicroseconds(originalPosition);
}

void loop() {
  // servo to original position after each loop
  myServo.writeMicroseconds(originalPosition);

  while (Serial.available() > 0) {
    int pulseWidth = Serial.parseInt();
    pulseWidth = constrain(pulseWidth, 500, 2500);
    
    // store the original position
    originalPosition = myServo.readMicroseconds();
    // set the servo position based on pulse
    myServo.writeMicroseconds(pulseWidth);

    delay(1000);

    // reverse calculation
    int reversePosition = originalPosition - (pulseWidth - originalPosition);
    myServo.writeMicroseconds(reversePosition);

    delay(1000);

    // servo to original pos
    myServo.writeMicroseconds(originalPosition);

    delay(1000);

    while (Serial.available() > 0) {
      Serial.read();
    }
  }
}
