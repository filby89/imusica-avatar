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

            [DataMember(Name = "Type")]
            public string type { get; set; }


            [DataMember(Name = "skeletons")]
            public List<JSONSkeleton> Skeletons { get; set; }
        }

        [DataContract(Name = "JointID")]
        class JSONSkeleton
        {
            [DataMember(Name = "id")]
            public string ID { get; set; }

            [DataMember(Name = "pid")]
            public int pID { get; set; }

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

            [DataMember(Name = "z")]
            public double Z { get; set; }
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
            JSONSkeletonCollection jsonSkeletons = new JSONSkeletonCollection { Skeletons = new List<JSONSkeleton>(), type="skeleton" };

            foreach (var skeleton in skeletons)
            {
                JSONSkeleton jsonSkeleton = new JSONSkeleton
                {
                    ID = skeleton.TrackingId.ToString(),
                    pID = Convert.ToInt32(skeleton.Joints[0].Position.X > 0), //SpineBase right or left of cam.
                    Joints = new List<JSONJoint>()
                };

                foreach (Joint joint in skeleton.Joints.Values)
                {
                    
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
                        X = joint.Position.X,
                        Y = joint.Position.Y,
                        Z = joint.Position.Z

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