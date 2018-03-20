using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Text;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Json;
using Microsoft.Kinect;
using System.Windows;

namespace KinectCoordinateMapping
{
    public static class BodySerializer
    {

        [DataContract(Name="Skeleton")]
        class JSONSkeletonCollection
        {
            [DataMember(Name = "skeleton")]
            public string ID { get; set; }

            [DataMember(Name = "skeletons")]
            public List<JSONSkeleton> Skeletons { get; set; }
        }

        [DataContract(Name = "JointID")]
        class JSONSkeleton
        {
            [DataMember(Name = "id")]
            public string ID { get; set; }

            [DataMember(Name = "joints")]
            public List<JSONJoint> Joints { get; set; }
        }

        [DataContract(Name = "JointValues")]
        class JSONJoint
        {
            [DataMember(Name = "name")]
            public string Name { get; set; }

            [DataMember(Name = "x")]
            public double X { get; set; }

            [DataMember(Name = "y")]
            public double Y { get; set; }

            [DataMember(Name = "Xw")]
            public double Xw { get; set; }

            [DataMember(Name = "Yw")]
            public double Yw { get; set; }

            [DataMember(Name = "Zw")]
            public double Zw { get; set; }

        }

        /// <summary>
        /// Serializes an array of Kinect skeletons into an array of JSON skeletons.
        /// </summary>
        /// <param name="skeletons">The Kinect skeletons.</param>
        /// <param name="mapper">The coordinate mapper.</param>
        /// <param name="mode">Mode (color or depth).</param>
        /// <returns>A JSON representation of the skeletons.</returns>
        public static string Serialize(this List<Body> skeletons, CoordinateMapper mapper, CameraMode mode)
        {
            JSONSkeletonCollection jsonSkeletons = new JSONSkeletonCollection { Skeletons = new List<JSONSkeleton>() };

            foreach (var skeleton in skeletons)
            {
                JSONSkeleton jsonSkeleton = new JSONSkeleton
                {
                    ID = skeleton.TrackingId.ToString(),
                    Joints = new List<JSONJoint>()
                };

                foreach (Joint joint in skeleton.Joints.Values)
                {                        
                    //Joint currentJoint = new Joint();
                    /*if (joint.JointType != JointType.Head && joint.JointType != JointType.Neck && joint.JointType != JointType.SpineBase
                        && joint.JointType != JointType.SpineMid && joint.JointType != JointType.SpineShoulder
                        && joint.JointType != JointType.HandRight && joint.JointType != JointType.HandLeft)*/
                    
                    //use if only need to send those joints
                    //if (joint.JointType != JointType.Neck && joint.JointType != JointType.SpineBase
                    //      && joint.JointType != JointType.HandRight && joint.JointType != JointType.HandLeft)
                    //
                    //continue;


                    CameraSpacePoint jointPosition = joint.Position;
                    Point point = new Point();

                    switch (mode)
                    {
                        case CameraMode.Color:
                            ColorSpacePoint colorPoint = mapper.MapCameraPointToColorSpace(jointPosition);//(joint.Position); //, ColorImageFormat.RgbResolution640x480Fps30);                            
                            point.X = float.IsInfinity(colorPoint.X) ? 0 : colorPoint.X;
                            point.X = Math.Round(point.X, 2);
                            point.Y = float.IsInfinity(colorPoint.Y) ? 0 : colorPoint.Y;
                            point.Y = Math.Round(point.Y, 2);
                            break;

                        case CameraMode.Depth:
                            DepthSpacePoint depthPoint = mapper.MapCameraPointToDepthSpace(joint.Position);//, DepthSpaceFormat.Resolution640x480Fps30);
                            point.X = float.IsInfinity(depthPoint.X) ? 0 : depthPoint.X;
                            point.Y = float.IsInfinity(depthPoint.Y) ? 0 : depthPoint.Y;
                            break;
                        default:
                            break;
                    }

                    jsonSkeleton.Joints.Add(new JSONJoint
                    {
                        Name = joint.JointType.ToString(),
                        X = point.X, //joint.Position.X,//, 
                        Y = point.Y, //joint.Position.Y,//point.Y, 
                        Xw = joint.Position.X,
                        Yw = joint.Position.Y,
                        Zw = joint.Position.Z

                    });
                }

                jsonSkeletons.Skeletons.Add(jsonSkeleton);
            }

            return Serialize(jsonSkeletons);
        }

        /// <summary>
        /// Serializes an object to JSON.
        /// </summary>
        /// <param name="obj">The specified object.</param>
        /// <returns>A JSON representation of the object.</returns>
        private static string Serialize(object obj)
        {
            //Console.WriteLine("In Body Serializing");
            DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());

            using (MemoryStream ms = new MemoryStream())
            {
                serializer.WriteObject(ms, obj);

                return Encoding.Default.GetString(ms.ToArray());
                //ms.Close();
                //ms.Dispose();
            }
        }
    }
}

//point.X = colorPoint.X;
//point.Y = colorPoint.Y;
//convert the value to X/Y
//float scaledcolorPoint = colorPoint.ScaleTo(1280, 720);

//convert & scale (.3 = means 1/3 of joint distance)
//scaledJoint = colorPoint.ScaleTo(1280, 720, .3f, .3f);
//using System;
//using System.Collections;
//using System.Collections.Generic;
//using System.Linq;
//using System.IO;
//using System.Text;
//using System.Runtime.Serialization;
//using System.Runtime.Serialization.Json;
//using Microsoft.Kinect;
//using System.Windows;
//using System.ComponentModel;
//using System.Diagnostics;
//using System.Globalization;
//using System.Windows.Media;
//using System.Windows.Media.Imaging;


//namespace Kinect.Server
//{
//    /// <summary>
//    /// Serializes a Kinect skeleton to JSON fromat.
//    /// </summary>
//    public static class SkeletonSerializer
//    {
//        [DataContract]
//        class JSONSkeletonCollection
//        {
//            [DataMember(Name = "skeletons")]
//            public List<JSONSkeleton> Skeletons { get; set; }
//        }

//        [DataContract]
//        class JSONSkeleton
//        {
//            [DataMember(Name = "id")]
//            public string ID { get; set; }

//            [DataMember(Name = "joints")]
//            public List<JSONJoint> Joints { get; set; }
//        }

//        [DataContract]
//        class JSONJoint
//        {
//            [DataMember(Name = "name")]
//            public string Name { get; set; }

//            [DataMember(Name = "x")]
//            public string X { get; set; }

//            [DataMember(Name = "y")]
//            public string Y { get; set; }

//            [DataMember(Name = "z")]
//            public string Z { get; set; }
//        }

//        public static void Log(string logMessage, TextWriter w)
//        {
//            /* w.Write("\r\nLog Entry : ");
//             w.WriteLine("{0} {1}", DateTime.Now.ToLongTimeString(),
//                 DateTime.Now.ToLongDateString());
//             w.WriteLine("  :");
//             w.WriteLine("  :{0}", logMessage);
//             w.WriteLine("-------------------------------");*/
//        }


//        /// <summary>
//        /// Serializes an array of Kinect skeletons into an array of JSON skeletons.
//        /// </summary>
//        /// <param name="skeletons">The Kinect skeletons.</param>
//        /// <param name="mapper">The coordinate mapper.</param>
//        /// <param name="mode">Mode (color or depth).</param>
//        /// <returns>A JSON representation of the skeletons.</returns>
//        public static string Serialize(this List<Body> skeletons, CoordinateMapper mapper, CameraMode mode) //CoordinateMapper mapper, CameraMode mode
//        {
//            JSONSkeletonCollection jsonSkeletons = new JSONSkeletonCollection { Skeletons = new List<JSONSkeleton>() };

//            foreach (Body skeleton in skeletons) //check if the skeleton is tracked first
//            {
//                if (skeleton.IsTracked)
//                {
//                    JSONSkeleton jsonSkeleton = new JSONSkeleton
//                    {
//                        ID = skeleton.TrackingId.ToString(),
//                        Joints = new List<JSONJoint>()
//                    };


//                    IReadOnlyDictionary<JointType, Joint> joints = skeleton.Joints;
//                    var jointPoints = new Dictionary<JointType, Point>();

//                    foreach (JointType jointType in joints.Keys)
//                    {
//                        Joint joint = joints[jointType];


//                        Point point = new Point();

//                        switch (mode)
//                        {
//                            case Mode.Color:
//                                ColorSpacePoint colorPoint = mapper.MapCameraPointToColorSpace(joint.Position);
//                                point.X = colorPoint.X;
//                                point.Y = colorPoint.Y;
//                                break;
//                            case Mode.Depth:
//                                DepthSpacePoint depthPoint = mapper.MapCameraPointToDepthSpace(joint.Position);
//                                point.X = depthPoint.X;
//                                point.Y = depthPoint.Y;
//                                break;
//                            default:
//                                break;
//                        }


//                        jsonSkeleton.Joints.Add(new JSONJoint
//                        {
//                            //Name = joint.JointType.ToString(),
//                            //X = point.X,//joint.Position.X,
//                            //Y = point.Y,//joint.Position.Y,
//                            //Z = joint.Position.Z,
//                            Name = joint.JointType.ToString().ToLower(),
//                            X = point.X.ToString(),
//                            Y = point.Y.ToString(),
//                            Z = joint.Position.Z.ToString()
//                        });
//                    }

//                    jsonSkeletons.Skeletons.Add(jsonSkeleton);
//                }
//            }


//            return Serialize(jsonSkeletons);

//        }


//        /// <summary>
//        /// Serializes an object to JSON.
//        /// </summary>
//        /// <param name="obj">The specified object.</param>
//        /// <returns>A JSON representation of the object.</returns>
//        private static string Serialize(object obj)
//        {
//            DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
//            Console.WriteLine("In Body Serializing");
//            using (MemoryStream ms = new MemoryStream())
//            {
//                serializer.WriteObject(ms, obj);

//                return Encoding.Default.GetString(ms.ToArray());
//            }
//        }


//    }
//}

