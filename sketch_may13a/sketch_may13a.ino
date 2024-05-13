#include <Servo.h>

// Define the pins for the servo and the switch
const int servoPin = 9;
const int switchPin = 4;

Servo myServo;
bool servoRunning = false; // Flag to indicate whether the servo is currently spinning

void setup() {
  // Initialize serial communication for debugging
  Serial.begin(9600);

  // Attach the servo to its pin
  myServo.attach(servoPin);

  // Set the initial position of the servo to the center (90 degrees)
  myServo.writeMicroseconds(1500);

  // Set switch pin as input with internal pull-up resistor enabled
  pinMode(switchPin, INPUT_PULLUP);
}

void loop() {
  // Read the state of the switch
  int switchState = digitalRead(switchPin);

  // If the switch is pressed (LOW) and the servo is not already running
  if (switchState == HIGH && !servoRunning) {
    // Rotate the servo continuously in one direction
    myServo.writeMicroseconds(2000); // Adjust the pulse width to change the direction
    Serial.println("Servo started rotating.");
    servoRunning = true; // Set the flag to indicate servo is running
  }
  
  // If the switch is released (HIGH) and the servo is currently running
  if (switchState == LOW && servoRunning) {
    // Stop the servo immediately
    myServo.writeMicroseconds(1500); // Stop position
    Serial.println("Servo stopped.");
    servoRunning = false; // Set the flag to indicate servo has stopped
  }
}
