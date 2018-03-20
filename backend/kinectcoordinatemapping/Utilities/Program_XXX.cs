using Fleck;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Kinect;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Runtime.Serialization.Json;
using System.Web.Script.Serialization;
namespace WebSockets.Server
{
    class Program
    {
        // Store the subscribed clients.
        static List<IWebSocketConnection> clients = new List<IWebSocketConnection>();

        // Initialize the WebSocket server connection.
        
        static Body[] bodies = new Body[6];
        
        //static KinectSensor kinectSensor = null;
        static CoordinateMapper _coordinateMapper;
        static Mode _mode = Mode.Color;


        static void Main(string[] args)
        {
  



            //const string SkeletonStreamName = "skeleton";
            //SkeletonStreamMessage skeletonStreamMessage;// = new SkeletonStreamMessage { stream = SkeletonStreamName };

            KinectSensor kinectSensor = KinectSensor.GetDefault();
            BodyFrameReader bodyFrameReader = null;
            bodyFrameReader = kinectSensor.BodyFrameSource.OpenReader();
            ColorFrameReader colorFrameReader = null;
            colorFrameReader = kinectSensor.ColorFrameSource.OpenReader();

            _coordinateMapper = kinectSensor.CoordinateMapper;
            kinectSensor.Open();

            WebSocketServer server = new WebSocketServer("ws://localhost:8181");
            server.Start(socket =>
            {
                socket.OnOpen = () =>
                {
                    // Add the incoming connection to our list.
                    clients.Add(socket);
                };

                socket.OnClose = () =>
                {
                    // Remove the disconnected client from the list.
                    clients.Remove(socket);
                };


                socket.OnMessage = message =>
                {
                    if (message == "get-video")
                    {
                        int NUMBER_OF_FRAMES = new DirectoryInfo("Video").GetFiles().Length;

                        // Send the video as a list of consecutive images.
                        for (int index = 0; index < NUMBER_OF_FRAMES; index++)
                        {
                            foreach (var client in clients)
                            {

                                string path = "Video/" + index + ".jpg";
                                byte[] image = ImageUtil.ToByteArray(path);

                                client.Send(image);
                            }

                            //   We send 30 frames per second, so sleep for 34 milliseconds.
                            System.Threading.Thread.Sleep(270);
                        }

                    }

                    else if (message == "get-bodies")
                    {
                        if (kinectSensor.IsOpen)
                        {
                            if (bodyFrameReader != null)
                            {
                                bodyFrameReader.FrameArrived += bodyFrameReader_FrameArrived;

                            }
                        }
                    }
                    else if (message == "get-color")
                    {
                        if (kinectSensor.IsOpen)
                        {
                            if (colorFrameReader != null)
                            {
                                colorFrameReader.FrameArrived += colorFrameReader_FrameArrived;
                            }
                        }
                    }


                };
            });

            // Wait for a key press to close...

            Console.ReadLine();
            kinectSensor.Close();
        }

        private static void colorFrameReader_FrameArrived(object sender, ColorFrameArrivedEventArgs e)
        {

            //throw new NotImplementedException();
            using (ColorFrame colorFrame = e.FrameReference.AcquireFrame()) {
                if (colorFrame != null) {
                   
                    var blob = colorFrame.Serialize();

                    foreach (var client in clients)
                    {
                        if (blob != null)
                        {
                            client.Send(blob);
                            Console.WriteLine("After color Blob sent");
                        }
                    }
                }
            }
        }

        private static void bodyFrameReader_FrameArrived(object sender, BodyFrameArrivedEventArgs e)
        {
            //throw new NotImplementedException();
            bool dataReceived = false;



            using (BodyFrame bodyFrame = e.FrameReference.AcquireFrame())
            {
                if (bodyFrame != null)
                {
                    if (bodies == null)
                    {
                        bodies = new Body[bodyFrame.BodyCount];
                       
                    }

                    // The first time GetAndRefreshBodyData is called, Kinect will allocate each Body in the array.
                    // As long as those body objects are not disposed and not set to null in the array,
                    // those body objects will be re-used.
                    bodyFrame.GetAndRefreshBodyData(bodies);
                    dataReceived = true;
                }
            }

            if (dataReceived)
            {

                foreach (var client in clients)
                {
                    
                    var users = bodies.Where(s => s.IsTracked.Equals(true)).ToList();

                    if (users.Count>0){
                        string json = users.Serialize(_coordinateMapper, _mode);

                        Console.WriteLine("jsonstring: " + json);
                        Console.WriteLine("After body serialization and to send");

                        client.Send(json);
                    }
                    
                }
            }

        }
    }


}