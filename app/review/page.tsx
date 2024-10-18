"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import Link from "next/link";

interface PlotData {
  id: string;
  x: number;
  y: number;
  content: string;
  isStudentResponse: boolean;
  bufferRange?: number;
}

export default function ReviewPage() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [plotData, setPlotData] = useState<PlotData[]>([]);
  const [isPCA, setIsPCA] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    fetchPlotData();
  }, []);

  const handleReviewClick = async () => {
    setIsReviewing(true);
    setError(null);
    try {
      const response = await fetch("/api/process-embeddings", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to process embeddings");
      }

      const data = await response.json();
      if (data.success) {
        alert("Embeddings have been processed. Fetching plot data...");
        await fetchPlotData();
      } else {
        throw new Error("Embedding process failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to process embeddings. Please try again.");
    } finally {
      setIsReviewing(false);
    }
  };

  const fetchPlotData = async () => {
    try {
      const response = await fetch("/api/fetch-embeddings");
      if (!response.ok) {
        throw new Error("Failed to fetch embeddings");
      }
      const data = await response.json();
      if (data.success) {
        console.log("Fetched plot data:", data);
        setPlotData(data.data);
        setIsPCA(data.isPCA);
      } else {
        throw new Error(data.error || "Failed to fetch embeddings");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch embeddings. Please try again.");
    }
  };

  useEffect(() => {
    if (plotData.length > 0 && svgRef.current) {
      createScatterPlot();
    }
  }, [plotData]);

  const createScatterPlot = () => {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(plotData, (d) => d.x) as [number, number])
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(plotData, (d) => d.y) as [number, number])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "rgba(255, 255, 255, 0.9)")
      .style("color", "black") // Add this line to set the text color to black
      .style("border", "1px solid #ddd")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
      .style("font-size", "12px")
      .style("max-width", "250px")
      .style("z-index", "10");

    // Add buffer ranges for AI-generated responses
    svg
      .selectAll(".buffer")
      .data(plotData.filter((d) => !d.isStudentResponse))
      .enter()
      .append("circle")
      .attr("class", "buffer")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", (d) => d.bufferRange || 90)
      .style("fill", "none")
      .style("stroke", "#f56565")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5);

    // Add points
    const points = svg
      .selectAll(".point")
      .data(plotData)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("r", 5)
      .style("fill", (d) => (d.isStudentResponse ? "#48bb78" : "#f56565"));

    // Check for student responses within buffer ranges
    plotData.forEach((studentPoint) => {
      if (studentPoint.isStudentResponse) {
        const inRange = plotData.some(
          (aiPoint) =>
            !aiPoint.isStudentResponse &&
            Math.sqrt(
              Math.pow(x(studentPoint.x) - x(aiPoint.x), 2) +
                Math.pow(y(studentPoint.y) - y(aiPoint.y), 2)
            ) <= (aiPoint.bufferRange || 90)
        );
        if (inRange) {
          points
            .filter((d) => d.id === studentPoint.id)
            .style("fill", "#ffd700"); // Change to yellow
        }
      }
    });

    // Add interactivity
    points
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html(
            `<strong>ID:</strong> ${d.id}<br/>
             <strong>Content:</strong> ${d.content}<br/>
             <strong>Type:</strong> ${
               d.isStudentResponse ? "Student Response" : "AI Generated"
             }
             ${
               !d.isStudentResponse
                 ? `<br/><strong>Buffer Range:</strong> 
                    <input type="range" min="10" max="150" value="${
                      d.bufferRange || 90
                    }" id="bufferRange-${d.id}">`
                 : ""
             }`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);

        if (!d.isStudentResponse) {
          d3.select(`#bufferRange-${d.id}`).on("input", (event) => {
            const target = event.target as HTMLInputElement;
            const newRange = parseInt(target.value);
            setPlotData((prevData) =>
              prevData.map((point) =>
                point.id === d.id ? { ...point, bufferRange: newRange } : point
              )
            );
          });
        }
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Add legend
    const legend = svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(["Student Response", "AI Generated", "Potential Misconduct"])
      .enter()
      .append("g")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", (d) =>
        d === "Student Response"
          ? "#48bb78"
          : d === "AI Generated"
          ? "#f56565"
          : "#ffd700"
      );

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text((d) => d);
  };

  return (
    <div className="min-h-screen bg-green-50 py-8 relative">
      <Link
        href="/"
        className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
      >
        Back
      </Link>
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-green-700">
          Review
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-8">
          <button
            onClick={handleReviewClick}
            disabled={isReviewing}
            className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-300 transition-colors"
          >
            {isReviewing
              ? "Processing Embeddings..."
              : "Review Student Answers"}
          </button>
        </div>
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {plotData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-700">
              Embeddings Visualization
            </h2>
            <p className="mb-4">Total data points: {plotData.length}</p>
            {!isPCA && (
              <p className="text-yellow-600 mb-4">
                Note: Displaying raw embedding data due to insufficient data for
                PCA.
              </p>
            )}
            <svg ref={svgRef}></svg>
          </div>
        )}
      </div>
    </div>
  );
}
