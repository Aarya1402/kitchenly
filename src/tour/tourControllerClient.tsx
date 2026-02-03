"use client";

import dynamic from "next/dynamic";

const TourController = dynamic(() => import("@/tour/tourController"), {
  ssr: false,
});

export default function TourControllerClient() {
  return <TourController />;
}
