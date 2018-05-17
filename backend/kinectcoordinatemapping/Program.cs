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
                    // canvas.Children.Clear();

                    _bodies = new Body[frame.BodyFrameSource.BodyCount];
                    frame.GetAndRefreshBodyData(_bodies);

                    foreach (var body in _bodies)
                    {
                        if (body.IsTracked && !gotBody)
                        {
                            gotBody = true;
                            foreach (var client in clients)
                            {
                                var users = _bodies.Where(s => s.IsTracked.Equals(true)).ToList();
                                if (users.Count > 0)
                                {
                                    string json = users.Serialize(_sensor.CoordinateMapper, _mode);

                                    client.Send(json);
                                }
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