#include <Servo.h>

// Define the pins for the servo
const int servoPin = 9;

Servo myServo;
int originalPosition = 1500; // Original position of the servo (1500 microseconds)

void setup() {
  // Initialize serial communication for debugging
  //Serial.begin(115200);
Serial.begin(9600);
  // Attach the servo to its pin
  myServo.attach(servoPin);

  // Set the initial position of the servo to the center (1500 microseconds)
  myServo.writeMicroseconds(originalPosition);
}

void loop() {
  // Reset the servo to the original position at the beginning of each loop iteration
  myServo.writeMicroseconds(originalPosition);

  // Read serial input:
  while (Serial.available() > 0) {
    // Read the incoming value
    int pulseWidth = Serial.parseInt();
    
    // Ensure the pulse width is within valid range (500 to 2500 microseconds)
    pulseWidth = constrain(pulseWidth, 500, 2500);
    
    // Store the original position before moving the servo
    originalPosition = myServo.readMicroseconds();

    // Set the servo position based on the received pulse width
    myServo.writeMicroseconds(pulseWidth);

    // Print the pulse width for debugging
    Serial.print("Pulse width set to: ");
    Serial.println(pulseWidth);

    // Delay for a moment (adjust as needed)
    delay(1000); // Delay for 1 second (1000 milliseconds)

    // Calculate the reverse position
    int reversePosition = originalPosition - (pulseWidth - originalPosition);

    // Set the servo to the reverse position
    myServo.writeMicroseconds(reversePosition);

    // Delay for a moment (adjust as needed)
    delay(1000); // Delay for 1 second (1000 milliseconds)

    // Return the servo to the original position
    myServo.writeMicroseconds(originalPosition);

    // Delay for a moment (adjust as needed)
    delay(1000); // Delay for 1 second (1000 milliseconds)

    // Clear the serial input buffer before reading new data
    while (Serial.available() > 0) {
      Serial.read();
    }
  }
}
