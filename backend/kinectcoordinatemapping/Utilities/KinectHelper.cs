using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Windows;
//using Microsoft.Research.Kinect.Nui;
using System.IO;
using System.Text;
using System.Runtime.Serialization;
using Microsoft.Kinect;

namespace KinectCoordinateMapping 
{
    /// <summary>
    /// Helper extension methods for skeleton joint scaling.
    /// Resource: http://c4fkinect.codeplex.com/SourceControl/changeset/view/70823#1215366.
    /// </summary>
    public static class KinectHelper
    {
        public static Joint ScaleTo(this Joint joint, int width, int height, float skeletonMaxX, float skeletonMaxY)
        {
            Vector pos = new Vector()
            {
                X = Scale(width, skeletonMaxX, joint.Position.X),
                Y = Scale(height, skeletonMaxY, -joint.Position.Y),
                //Z = joint.Position.Z,
                //W = joint.Position.W
            };

            Joint j = new Joint()
            {
                //ID = joint.JointType,
                TrackingState = joint.TrackingState,
                Position = pos,
            };

            return j;
        }

        public static Joint ScaleTo(this Joint joint, int width, int height)
        {
            return ScaleTo(joint, width, height, 1.0f, 1.0f);
        }

        private static float Scale(int maxPixel, float maxSkeleton, float position)
        {
            float value = ((((maxPixel / maxSkeleton) / 2) * position) + (maxPixel / 2));
            if (value > maxPixel)
                return maxPixel;
            if (value < 0)
                return 0;
            return value;
        }
    }
}
