using Microsoft.Kinect; //
using Microsoft.Kinect.VisualGestureBuilder;
using System; //
using System.Collections.Generic; //
using System.Linq; //
using System.Text;
using System.Threading.Tasks;
using System.Windows; //
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Net.Sockets;
using System.IO; //
using Fleck;
using System.Runtime.Serialization; //
using System.Runtime.Serialization.Formatters.Binary;
using System.Runtime.Serialization.Json; //
using System.Web.Script.Serialization;
using System.Security.Cryptography.X509Certificates;

namespace KinectCoordinateMapping
{
    [DataContract(Name = "GestureProperties")]
    public class JSONBowGesture
    {

        [DataMember(Name = "gestures")]
        public string ID { get; set; }

        [DataMember(Name = "RightX")]
        public double RightX { get; set; }

        [DataMember(Name = "RightXVel")]
        public double RightXVel { get; set; }


        [DataMember(Name = "rightHandX")]
        public double rightHandX { get; set; }

        [DataMember(Name = "rightHandY")]
        public double rightHandY { get; set; }

        [DataMember(Name = "headX")]
        public double headX { get; set; }

        [DataMember(Name = "headY")]
        public double headY{ get; set; }


        [DataMember(Name = "LeftY")]
        public double LeftY { get; set; }

        [DataMember(Name = "LeftX")]
        public double LeftX { get; set; }

        [DataMember(Name = "GestureDirection")]
        public String GestureDirection { get; set; }

        [DataMember(Name = "OpenGest")]
        public bool OpenGest { get; set; }

        [DataMember(Name = "Type")]
        public string type { get; set; }

    }

    [DataContract(Name = "JsonStartStop")]
    public class JsonStartStop
    {

        [DataMember(Name = "gesture")]
        public string gesture { get; set; }

    }

    //public partial class MainWindow : Window
    class Program
    {
        public static KinectSensor _sensor;
        //static CoordinateMapper coordinateMapper;
        static Body[] _bodies = new Body[0]; //or[1]
        //static IList<Body> _bodies;
        static CameraMode _mode = CameraMode.Color;

        public static VisualGestureBuilderDatabase _gestureDatabase;
        public static VisualGestureBuilderFrameSource _gestureFrameSource;
        public static VisualGestureBuilderFrameReader _gestureFrameReader;

        static Gesture _Guitar_Static;
        static Gesture _Guitar_Open;
        static Gesture _Guitar_Start;
        static Gesture _Guitar_Stop;

        static bool detectedGesture = false;
        static bool detectedGestureOpen = false;
        static bool detectedGestureStatic = false;
        static bool detectedGestureStart = false;
        static bool detectedGestureStop = false;
        static bool airguitarEvent_down = false;
        static bool previousUp = false;
        static BodyFrameReader _body_reader;

        // Variables concerning the websocket server connections        
        static List<IWebSocketConnection> clients = new List<IWebSocketConnection>();
        //static bool gotBody = false;
        //public bool isSendingGestures = false;

        // Initialise
        static void Main(string[] args)
        {
            InitializeConnections();
            Program serv = new Program();
            serv.InitilizeKinect();

            Console.ReadLine();
            return;
        }

        private static void InitializeConnections()
        {
            WebSocketServer server = new WebSocketServer("ws://0.0.0.0:8181");
            WebSocketServer secure_server = new WebSocketServer("wss://0.0.0.0:8182");
            secure_server.Certificate = new X509Certificate2("509.pfx", "asdf");
            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    clients.Add(socket);
                };

                socket.OnClose = () =>
                {
                    clients.Remove(socket);
                };

            });
            secure_server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    clients.Add(socket);
                };

                socket.OnClose = () =>
                {
                    clients.Remove(socket);
                };

            });
        }

        private void InitilizeKinect()
        {
            _sensor = KinectSensor.GetDefault();

            if (_sensor != null)
            {
                _sensor.Open();

                _body_reader = _sensor.BodyFrameSource.OpenReader();
                _body_reader.FrameArrived += BodyFrameArrived;

                _gestureDatabase = new VisualGestureBuilderDatabase(@"Gestures/Guitar_131017.gbd"); //230917 - 120917
                _gestureFrameSource = new VisualGestureBuilderFrameSource(_sensor, 0);
                // Add all gestures in the database to the framesource..
                _gestureFrameSource.AddGestures(_gestureDatabase.AvailableGestures);

                foreach (var gesture in _gestureDatabase.AvailableGestures)
                {
                    if (gesture.Name == "Guitar_Static")
                    {
                        _Guitar_Static = gesture;
                    }
                    if (gesture.Name == "Guitar_Open")
                    {
                        _Guitar_Open = gesture;
                    }
                    if (gesture.Name == "Start")
                    {
                        _Guitar_Start = gesture;
                    }
                    if (gesture.Name == "Stop")
                    {
                        _Guitar_Stop = gesture;
                    }
                }
                _gestureFrameReader = _gestureFrameSource.OpenReader();
                _gestureFrameReader.IsPaused = true;
                _gestureFrameReader.FrameArrived += reader_FrameArrived;
            }
            Console.ReadLine();
            _sensor.Close();
        }


        /// <summary>
        /// Handles the body frame data arriving from the sensor
        /// </summary>
        /// <param name="sender">object sending the event</param>
        /// <param name="e">event arguments</param>
        private void BodyFrameArrived(object sender, BodyFrameArrivedEventArgs e)
        {
            bool dataReceived = false;

            using (BodyFrame frame = e.FrameReference.AcquireFrame())
            {


                if (frame != null)
                {
                    bool gotBody = false;
                    int idx = 0; // index for scale position
                    //canvas.Children.Clear();

                    _bodies = new Body[frame.BodyFrameSource.BodyCount];
                    frame.GetAndRefreshBodyData(_bodies);

                    //Console.WriteLine("Reading Bodies");
                    foreach (var body in _bodies)
                    {

                        //Console.WriteLine("Is body tracked ? " + body.IsTracked);
                        //Console.WriteLine("Is gotbody = " + !gotBody);

                        if (body.IsTracked && !gotBody)
                        {
                            gotBody = true;
                            foreach (var client in clients)
                            {
                                // This is working Console.WriteLine("what the hell 3- HEREEEEEE");
                                var users = _bodies.Where(s => s.IsTracked.Equals(true)).ToList();
                                if (users.Count > 0)
                                {
                                    string json = users.Serialize(_sensor.CoordinateMapper, _mode);

                                    //Console.WriteLine("jsonstring: " + json);
                                    //Console.WriteLine("After body serialization and to send");

                                    client.Send(json);
                                }
                            }
                            //Console.WriteLine("Everything is tracked...... ");
                            //Console.WriteLine("Tracking ID " + body.TrackingId);
                            _gestureFrameSource.TrackingId = body.TrackingId;
                            _gestureFrameReader.IsPaused = false;

                            double xLHPos = 0.0;
                            double yLHPos = 0.0; double yRHPos = 0.0; double yHPos = 0.0; double ySBPos = 0.0;
                            double xRHPos = 0.0; //double xHPos = 0.0; 
                            double xSBPos = 0.0; double xSMPos = 0.0; double ySMPos = 0.0;
                            double xLH3DPos = 0.0; double yLH3DPos = 0.0; double zLH3DPos = 0.0;
                            double xRH3DPos = 0.0; /*double yRH3DPos = 0.0;*/ double zRH3DPos = 0.0;
                            double xH3DPos = 0.0; double yH3DPos = 0.0; double zH3DPos = 0.0;
                            double xLEPos = 0.0;
                            double yLEPos = 0.0;
                            double xLEH3DPos = 0.0;
                            double yLE3DPos = 0.0;
                            double zLE3DPos = 0.0;
                            double xSB3DPos = 0.0; double ySB3DPos = 0.0; double zSB3DPos = 0.0;
                            double xSM3DPos = 0.0; double ySM3DPos = 0.0; double zSM3DPos = 0.0;
                            double xNPos = 0.0; double yNPos = 0.0; double xN3DPos = 0.0; double yN3DPos = 0.0; double zN3DPos = 0.0;
                            double yRH3DPos = 0.0;
                            double rightYprev = 0.0; double rightVel = 0.0;

                            int messageCount = 0;

                            // COORDINATE MAPPING  
                            foreach (Joint joint in body.Joints.Values)
                            {
                                //Console.WriteLine("Do you see joints");
                                Joint currentJoint = new Joint();
                                if (joint.JointType == JointType.Head || joint.JointType == JointType.Neck || joint.JointType == JointType.SpineBase
                                    || joint.JointType == JointType.SpineMid || joint.JointType == JointType.SpineShoulder
                                    || joint.JointType == JointType.HandRight || joint.JointType == JointType.HandLeft)
                                {
                                    currentJoint.Position.X = (float)Convert.ToDouble(joint.Position.X);
                                    currentJoint.Position.Y = (float)Convert.ToDouble(joint.Position.Y);
                                    currentJoint.Position.Z = (float)Convert.ToDouble(joint.Position.Z);
                                    if (currentJoint.Position.Z < 0)
                                    {
                                        currentJoint.Position.Z = 0.1f;
                                    }
                                }

                                if (joint.TrackingState == TrackingState.Tracked)
                                {
                                    //Console.WriteLine("HERE 2");
                                    // 3D space point
                                    CameraSpacePoint jointPosition = currentJoint.Position;

                                    // 2D space point
                                    Point point = new Point();

                                    if (_mode == CameraMode.Color)
                                    {
                                        ColorSpacePoint colorPoint = _sensor.CoordinateMapper.MapCameraPointToColorSpace(jointPosition);

                                        point.X = float.IsInfinity(colorPoint.X) ? 0 : colorPoint.X;
                                        point.Y = float.IsInfinity(colorPoint.Y) ? 0 : colorPoint.Y;
                                    }
                                    else if (_mode == CameraMode.Depth || _mode == CameraMode.Infrared) // Change the Image and Canvas dimensions to 512x424
                                    {
                                        DepthSpacePoint depthPoint = _sensor.CoordinateMapper.MapCameraPointToDepthSpace(jointPosition);

                                        point.X = float.IsInfinity(depthPoint.X) ? 0 : depthPoint.X;
                                        point.Y = float.IsInfinity(depthPoint.Y) ? 0 : depthPoint.Y;
                                    }

                                    if (joint.JointType == JointType.HandLeft)
                                    {
                                        //xLHPosition.Text = point.X.ToString();
                                        //yLHPosition.Text = point.Y.ToString();
                                        xLHPos = point.X;
                                        yLHPos = point.Y;
                                        xLH3DPos = jointPosition.X;
                                        yLH3DPos = jointPosition.Y;
                                        zLH3DPos = jointPosition.Z;
                                    }
                                    if (joint.JointType == JointType.ElbowLeft)
                                    {
                                        xLEPos = point.X;
                                        yLEPos = point.Y;
                                        xLEH3DPos = jointPosition.X;
                                        yLE3DPos = jointPosition.Y;
                                        zLE3DPos = jointPosition.Z;
                                    }
                                    if (joint.JointType == JointType.HandRight)
                                    {
                                        yRHPos = point.Y;
                                        xRHPos = point.X;
                                        xRH3DPos = jointPosition.X;
                                        yRH3DPos = jointPosition.Y;
                                        zRH3DPos = jointPosition.Z;
                                        rightVel = Math.Abs(rightYprev - yRH3DPos);
                                        // Console.WriteLine("rightYprev: " + rightYprev);
                                        // Console.WriteLine("yRH3DPos: " + yRH3DPos);
                                        // Console.WriteLine("rightVel: " + rightVel);
                                        // Console.WriteLine("midposUD: " + midposUD);
                                        rightYprev = yRH3DPos;
                                        // Console.WriteLine("1 -- yRH3DPos: " + yRH3DPos);
                                    }
                                    if (joint.JointType == JointType.Head)
                                    {
                                        yHPos = point.Y;
                                        xH3DPos = jointPosition.X;
                                        yH3DPos = jointPosition.Y;
                                        zH3DPos = jointPosition.Z;
                                    }
                                    if (joint.JointType == JointType.Neck)
                                    {
                                        yNPos = point.Y;
                                        xNPos = point.X;
                                        xN3DPos = jointPosition.X;
                                        yN3DPos = jointPosition.Y;
                                        zN3DPos = jointPosition.Z;
                                    }
                                    if (joint.JointType == JointType.SpineBase)
                                    {
                                        ySBPos = point.Y;
                                        xSBPos = point.X;
                                        xSB3DPos = jointPosition.X;
                                        ySB3DPos = jointPosition.Y;
                                        zSB3DPos = jointPosition.Z;
                                    }
                                    if (joint.JointType == JointType.SpineMid)
                                    {
                                        ySMPos = point.Y;
                                        xSMPos = point.X;
                                        xSM3DPos = jointPosition.X;
                                        ySM3DPos = jointPosition.Y;
                                        zSM3DPos = jointPosition.Z;
                                    }
                                }
                            }

                            //if (yHPos != 0.0 && ySBPos != 0.0 && (detectedGesture == true))
                            //{

                            // DO THE MATH...
                            /*                                                                      
                            double max_dist = Math.Sqrt(
                            Math.Pow((xN3DPos - xSB3DPos), 2) +
                            Math.Pow((yN3DPos - ySB3DPos), 2) +
                            Math.Pow((zN3DPos - zSB3DPos), 2)
                            );
                            */
                            double max_dist = Math.Abs(yN3DPos - ySB3DPos);


                            // add a bit
                            // double addtoSpine = (ySM3DPos - ySB3DPos) / 4.0;
                            // max_dist = max_dist - addtoSpine;

                            // not used in current version =>
                            //double max_divide = max_dist - addtoSpine / 12;

                            // midposition for down/up in guitar playing (SpineBase - SpineMid)
                            // midposUD = (ySB3DPos + ySM3DPos) / 2.0;
                            double midposUD = ySB3DPos + max_dist / 3.0;

                            // airguitarEvent = (Math.Abs(xRH3DPos - xSB3DPos) / max_dist);
                            //airguitarEventT.Text = airguitarEvent.ToString();

                            // initially: lefthandpos = (Math.Abs(yLH3DPos - ySB3DPos) / (1.0 * max_dist));
                            // lefthandpos = (Math.Abs(yLH3DPos - (ySB3DPos+addtoSpine)) / (1.0 * max_dist));
                            double guitar_angle = 45;
                            max_dist = max_dist/Math.Cos(guitar_angle);
                            //Console.WriteLine(max_dist);

                            double lefthandposY = (Math.Abs(yLH3DPos - ySB3DPos) / max_dist);
                            double lefthandposX = (Math.Abs(xLH3DPos - xSB3DPos) / (5.0*max_dist));

                            double lefthandpos = Math.Sqrt(Math.Pow(yLH3DPos - ySB3DPos,2) + Math.Pow(xLH3DPos - xSB3DPos,2)) / max_dist;

                            //lefthandposT.Text = lefthandpos.ToString();
                            // lefthandpos = lefthandpos < 0 ? 0 : lefthandpos;

                            // Console.WriteLine("Lefthand Position: " + lefthandpos);
                            // lefthandpos = lefthandpos < 0 ? lefthandpos : lefthandpos;
                            // lefthandpos = lefthandpos > 1 ? 1 : lefthandpos; 
//                            string[] pentatonic = new string[] { "G", "A", "B", "D", "E", "G" };
 //                           idx = (int)Math.Floor((pentatonic.Length - 0.5) * (1 - lefthandpos));

                            //Console.WriteLine("DetectedGestureStatic = " + detectedGestureStatic);

                            if (detectedGestureOpen == true)
                            {

                            }


                            else if (detectedGestureStatic == true)
                            {

                                if (yRH3DPos < midposUD)
                                {
                                    // Console.WriteLine("Down");
                                    // Console.WriteLine(yRH3DPos-midposUD);

                                    //airguitarEventT.Text = "down";
                                    if (previousUp == true)
                                    {


                                        JSONBowGesture gestureData = new JSONBowGesture
                                        {
                                            // RightX = airguitarEvent_down,
                                            RightX = yRH3DPos - midposUD,
                                            RightXVel = rightVel,
                                            LeftX = lefthandposX,
                                            LeftY = lefthandpos,
                                            headX = xH3DPos,
                                            headY = yH3DPos,
                                            rightHandX = xRH3DPos,
                                            rightHandY = yRH3DPos, 
                                            GestureDirection = "down",
                                            OpenGest = detectedGestureOpen,
                                            type = "gesture"
                                        };
                                        messageCount += 1;
                                        //Console.WriteLine(messageCount + " LeftY-3: " + gestureData.LeftY);
                                        sendMessageWithContent(gestureData);
                                    }
                                    previousUp = false;
                                    // send also LH position
                                    // send also velocity
                                }
                                else if (yRH3DPos > midposUD)
                                {
                                    // Console.WriteLine("UP");
                                    // Console.WriteLine(yRH3DPos-midposUD);

                                    if (previousUp == false)
                                    {
                                        //lefthandposT.Text = lefthandpos.ToString();
                                        //Console.WriteLine("yLH3DPos: " + yLH3DPos);
                                        //Console.WriteLine("yLE3DPos: " + yLE3DPos);
                                        // Console.WriteLine("2 - airguitarEvent_down: " + airguitarEvent_down);
                                        // Console.WriteLine("3 - airguitarEvent_down: " + airguitarEvent_down);
                                        // send message for an up event
                                        JSONBowGesture gestureData = new JSONBowGesture
                                        {
                                            // RightX = airguitarEvent_down,
                                            RightX = yRH3DPos - midposUD,
                                            RightXVel = rightVel,
                                            LeftX = lefthandposX,
                                            LeftY = lefthandpos,
                                            GestureDirection = "up",
                                            OpenGest = detectedGestureOpen,
                                            type="gesture"
                                        };
                                        messageCount += 1;
                                        //Console.WriteLine(messageCount + " LeftY-4: " + gestureData.LeftY);
                                        sendMessageWithContent(gestureData);
                                        //send also LH position
                                        //send also velocity
                                    }
                                    previousUp = true;
                                }
                            }

                            else
                            {
                                detectedGesture = false;

                            }


                        }
                    }
                }
            }
        }


        //void 
        private static void reader_FrameArrived(object sender, VisualGestureBuilderFrameArrivedEventArgs e)
        {
            using (var frame = e.FrameReference.AcquireFrame())
            {
                if (frame != null && frame.DiscreteGestureResults != null)
                {
                    var resultStatic = frame.DiscreteGestureResults[_Guitar_Static];
                    var resultOpen = frame.DiscreteGestureResults[_Guitar_Open];
                    var resultStart = frame.DiscreteGestureResults[_Guitar_Start];
                    var resultStop = frame.DiscreteGestureResults[_Guitar_Stop];
                    detectedGestureStart = resultStart.Detected;

                    detectedGestureStop = resultStart.Detected;
                    if (resultStart.Detected)
                    {
                        var gesture = "start";
                        JsonStartStop gestureData = new JsonStartStop
                        {
                            // RightX = airguitarEvent_down,
                            gesture = gesture
                        };
                        sendMessageWithContent1(gestureData);
                    }

                    if (resultStop.Detected)
                    {
                        var gesture = "stop";
                        JsonStartStop gestureData = new JsonStartStop
                        {
                            // RightX = airguitarEvent_down,
                            gesture = gesture
                        };
                        sendMessageWithContent1(gestureData);
                    }

                    if (resultStatic.Detected == true)
                    {
                        detectedGestureStatic = true;
                        detectedGesture = true;
                    }
                }
            }
        }


        // Serialize an object to JSON
        // gestureDataIN = the specified object!!
        static void sendMessageWithContent(JSONBowGesture gestureDataIN)
        {
            foreach (var client in clients)
            {
                DataContractJsonSerializer serializer = new DataContractJsonSerializer(gestureDataIN.GetType());
                //Console.WriteLine("blablaBOWJSON");

                MemoryStream ms = new MemoryStream();
                serializer.WriteObject(ms, gestureDataIN);

                string json = Encoding.Default.GetString(ms.ToArray());
                //Console.WriteLine("JSON FRAME: " + json);
                client.Send(json);
            }
        }

        // Serialize an object to JSON
        // gestureDataIN = the specified object!!
        static void sendMessageWithContent1(JsonStartStop gesture)
        {
            foreach (var client in clients)
            {
                DataContractJsonSerializer serializer = new DataContractJsonSerializer(gesture.GetType());
                //Console.WriteLine("blablaBOWJSON");

                MemoryStream ms = new MemoryStream();
                serializer.WriteObject(ms, gesture);

                string json = Encoding.Default.GetString(ms.ToArray());
                //Console.WriteLine("JSON FRAME: " + json);
                client.Send(json);
            }
        }
    }
}