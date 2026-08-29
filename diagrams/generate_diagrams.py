#!/usr/bin/env python3
"""Generate all SellWise draw.io diagram files."""

import os

OUT_DIR = r"C:\Users\mrsoh\SDP\diagrams"
os.makedirs(OUT_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. GANTT CHART
# ─────────────────────────────────────────────────────────────────────────────
gantt = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="680" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Project Gantt Chart" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=20;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="80" y="20" width="700" height="40" as="geometry"/></mxCell>
    <mxCell id="h0" value="Task" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;" vertex="1" parent="1"><mxGeometry x="80" y="80" width="200" height="40" as="geometry"/></mxCell>
    <mxCell id="h1" value="Week 1-2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;" vertex="1" parent="1"><mxGeometry x="280" y="80" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="h2" value="Week 3-4" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;" vertex="1" parent="1"><mxGeometry x="380" y="80" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="h3" value="Week 5-6" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;" vertex="1" parent="1"><mxGeometry x="480" y="80" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="h4" value="Week 7-8" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;" vertex="1" parent="1"><mxGeometry x="580" y="80" width="100" height="40" as="geometry"/></mxCell>
    <mxCell id="h5" value="Week 9-10" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1;fontSize=12;" vertex="1" parent="1"><mxGeometry x="680" y="80" width="100" height="40" as="geometry"/></mxCell>
    <!-- Row 1 -->
    <mxCell id="r1l" value="Database &amp; Auth Setup" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;" vertex="1" parent="1"><mxGeometry x="80" y="120" width="200" height="40" as="geometry"/></mxCell>
    <mxCell id="r1c1" value="" style="rounded=4;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#007733;" vertex="1" parent="1"><mxGeometry x="285" y="128" width="90" height="24" as="geometry"/></mxCell>
    <mxCell id="r1c2" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="380" y="128" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r1c3" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="480" y="128" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r1c4" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="580" y="128" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r1c5" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="680" y="128" width="100" height="24" as="geometry"/></mxCell>
    <!-- Row 2 -->
    <mxCell id="r2l" value="Products &amp; POS System" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;" vertex="1" parent="1"><mxGeometry x="80" y="160" width="200" height="40" as="geometry"/></mxCell>
    <mxCell id="r2c1" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="280" y="168" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r2c2" value="" style="rounded=4;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#007733;" vertex="1" parent="1"><mxGeometry x="385" y="168" width="90" height="24" as="geometry"/></mxCell>
    <mxCell id="r2c3" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="480" y="168" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r2c4" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="580" y="168" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r2c5" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="680" y="168" width="100" height="24" as="geometry"/></mxCell>
    <!-- Row 3 -->
    <mxCell id="r3l" value="Dashboard &amp; ML Service" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;" vertex="1" parent="1"><mxGeometry x="80" y="200" width="200" height="40" as="geometry"/></mxCell>
    <mxCell id="r3c1" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="280" y="208" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r3c2" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="380" y="208" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r3c3" value="" style="rounded=4;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#007733;" vertex="1" parent="1"><mxGeometry x="485" y="208" width="90" height="24" as="geometry"/></mxCell>
    <mxCell id="r3c4" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="580" y="208" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r3c5" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="680" y="208" width="100" height="24" as="geometry"/></mxCell>
    <!-- Row 4 -->
    <mxCell id="r4l" value="RFM Segmentation &amp; Alerts" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;" vertex="1" parent="1"><mxGeometry x="80" y="240" width="200" height="40" as="geometry"/></mxCell>
    <mxCell id="r4c1" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="280" y="248" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r4c2" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="380" y="248" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r4c3" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="480" y="248" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r4c4" value="" style="rounded=4;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#007733;" vertex="1" parent="1"><mxGeometry x="585" y="248" width="90" height="24" as="geometry"/></mxCell>
    <mxCell id="r4c5" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="680" y="248" width="100" height="24" as="geometry"/></mxCell>
    <!-- Row 5 -->
    <mxCell id="r5l" value="Testing &amp; Final Polish" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;fontSize=11;" vertex="1" parent="1"><mxGeometry x="80" y="280" width="200" height="40" as="geometry"/></mxCell>
    <mxCell id="r5c1" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="280" y="288" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r5c2" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="380" y="288" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r5c3" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="480" y="288" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r5c4" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="580" y="288" width="100" height="24" as="geometry"/></mxCell>
    <mxCell id="r5c5" value="" style="rounded=4;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#007733;" vertex="1" parent="1"><mxGeometry x="685" y="288" width="90" height="24" as="geometry"/></mxCell>
    <!-- Legend -->
    <mxCell id="leg1b" value="" style="rounded=4;whiteSpace=wrap;html=1;fillColor=#00CC66;strokeColor=#007733;" vertex="1" parent="1"><mxGeometry x="80" y="360" width="30" height="20" as="geometry"/></mxCell>
    <mxCell id="leg1t" value="Active Sprint" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;" vertex="1" parent="1"><mxGeometry x="120" y="360" width="120" height="20" as="geometry"/></mxCell>
    <mxCell id="leg2b" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#ccc;" vertex="1" parent="1"><mxGeometry x="260" y="360" width="30" height="20" as="geometry"/></mxCell>
    <mxCell id="leg2t" value="Not Started / Idle" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11;" vertex="1" parent="1"><mxGeometry x="300" y="360" width="140" height="20" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 2. DFD LEVEL 0
# ─────────────────────────────────────────────────────────────────────────────
dfd0 = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="680" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - DFD Level 0 (Context Diagram)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="200" y="20" width="700" height="40" as="geometry"/></mxCell>
    <!-- External Entity: User -->
    <mxCell id="user" value="Owner / Manager / Employee" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="60" y="300" width="170" height="70" as="geometry"/></mxCell>
    <!-- Central Process -->
    <mxCell id="system" value="SellWise System" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=16;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="440" y="260" width="220" height="140" as="geometry"/></mxCell>
    <!-- External Entity: DB -->
    <mxCell id="db" value="SQL Server Database" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="870" y="240" width="150" height="70" as="geometry"/></mxCell>
    <!-- External Entity: ML -->
    <mxCell id="ml" value="Python ML Service (Prophet)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="870" y="380" width="150" height="70" as="geometry"/></mxCell>
    <!-- User --> System -->
    <mxCell id="e1" value="Login, Orders, Inventory CRUD" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.4;exitDx=0;exitDy=0;entryX=0;entryY=0.35;entryDx=0;entryDy=0;" edge="1" source="user" target="system" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- System --> User -->
    <mxCell id="e2" value="Reports, Alerts, Forecasts, KPIs" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0;exitY=0.65;exitDx=0;exitDy=0;entryX=1;entryY=0.65;entryDx=0;entryDy=0;" edge="1" source="system" target="user" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- System --> DB -->
    <mxCell id="e3" value="Read / Write Data" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.4;exitDx=0;exitDy=0;entryX=0;entryY=0.4;entryDx=0;entryDy=0;" edge="1" source="system" target="db" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- DB --> System -->
    <mxCell id="e4" value="Stored Records" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0;exitY=0.6;exitDx=0;exitDy=0;entryX=1;entryY=0.4;entryDx=0;entryDy=0;" edge="1" source="db" target="system" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- System --> ML -->
    <mxCell id="e5" value="90-day Sales History" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.7;exitDx=0;exitDy=0;entryX=0;entryY=0.4;entryDx=0;entryDy=0;" edge="1" source="system" target="ml" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- ML --> System -->
    <mxCell id="e6" value="30-day Prophet Forecast" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0;exitY=0.6;exitDx=0;exitDy=0;entryX=1;entryY=0.7;entryDx=0;entryDy=0;" edge="1" source="ml" target="system" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 3. DFD LEVEL 1
# ─────────────────────────────────────────────────────────────────────────────
dfd1 = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="900" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - DFD Level 1 (Process Decomposition)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="200" y="20" width="900" height="40" as="geometry"/></mxCell>
    <!-- External Entities -->
    <mxCell id="user" value="User (Owner / Manager / Employee)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="30" y="380" width="160" height="60" as="geometry"/></mxCell>
    <mxCell id="mlsvc" value="Python ML Service (Prophet)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="1150" y="580" width="160" height="60" as="geometry"/></mxCell>
    <!-- Data Stores -->
    <mxCell id="ds1" value="D1: Users / StoreMembers" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="700" y="80" width="160" height="60" as="geometry"/></mxCell>
    <mxCell id="ds2" value="D2: Products" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="700" y="210" width="160" height="60" as="geometry"/></mxCell>
    <mxCell id="ds3" value="D3: Orders / OrderItems" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="700" y="350" width="160" height="60" as="geometry"/></mxCell>
    <mxCell id="ds4" value="D4: Customers" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="700" y="490" width="160" height="60" as="geometry"/></mxCell>
    <mxCell id="ds5" value="D5: Forecasts Cache" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="700" y="630" width="160" height="60" as="geometry"/></mxCell>
    <!-- Processes -->
    <mxCell id="p1" value="1.0 Authenticate User" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="380" y="70" width="160" height="70" as="geometry"/></mxCell>
    <mxCell id="p2" value="2.0 Manage Products &amp; Inventory" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="380" y="200" width="160" height="70" as="geometry"/></mxCell>
    <mxCell id="p3" value="3.0 Process POS Orders" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="380" y="330" width="160" height="70" as="geometry"/></mxCell>
    <mxCell id="p4" value="4.0 Manage Customers &amp; RFM" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="380" y="470" width="160" height="70" as="geometry"/></mxCell>
    <mxCell id="p5" value="5.0 Analytics &amp; Forecasting" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="380" y="610" width="160" height="70" as="geometry"/></mxCell>
    <!-- User to Processes -->
    <mxCell id="u1" value="Login Credentials" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="user" target="p1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u2" value="Product Data" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="user" target="p2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u3" value="Cart / Order" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="user" target="p3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u4" value="Customer Info" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="user" target="p4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u5" value="Request Dashboard" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="user" target="p5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Processes to Data Stores -->
    <mxCell id="p1d1" value="Store/Read Session" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p1" target="ds1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p2d2" value="CRUD Products" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p2" target="ds2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3d3" value="Write Order (Transaction)" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p3" target="ds3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3d2" value="Deduct Stock" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p3" target="ds2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p4d4" value="Update RFM Scores" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p4" target="ds4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p5d3" value="Read Order History" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p5" target="ds3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p5d5" value="Cache Forecast" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p5" target="ds5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Process 5 <-> ML -->
    <mxCell id="p5ml1" value="90-day Sales History" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p5" target="mlsvc" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p5ml2" value="30-day Prophet Forecast" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="mlsvc" target="p5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- p5 back to user -->
    <mxCell id="p5u" value="KPIs, Charts, Alerts" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="p5" target="user" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 4. ER DIAGRAM
# ─────────────────────────────────────────────────────────────────────────────
er = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1000" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Entity Relationship Diagram (ERD)" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="400" y="20" width="700" height="40" as="geometry"/></mxCell>

    <!-- USERS table -->
    <mxCell id="tUsers" value="Users" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="40" y="80" width="200" height="150" as="geometry"/></mxCell>
    <mxCell id="u_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tUsers"><mxGeometry y="30" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="u_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r1R" value="Id (GUID)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r1"><mxGeometry x="40" width="160" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tUsers"><mxGeometry y="60" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r2L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r2R" value="Email" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r2"><mxGeometry x="40" width="160" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tUsers"><mxGeometry y="90" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r3R" value="PasswordHash" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r3"><mxGeometry x="40" width="160" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tUsers"><mxGeometry y="120" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r4R" value="FullName" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r4"><mxGeometry x="40" width="160" height="30" as="geometry"/></mxCell>

    <!-- STORES table -->
    <mxCell id="tStores" value="Stores" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="340" y="80" width="200" height="120" as="geometry"/></mxCell>
    <mxCell id="s_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tStores"><mxGeometry y="30" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="s_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r1R" value="Id (GUID)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r1"><mxGeometry x="40" width="160" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tStores"><mxGeometry y="60" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r2L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r2R" value="Name, BusinessType" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r2"><mxGeometry x="40" width="160" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tStores"><mxGeometry y="90" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r3R" value="OwnerId (FK -> Users)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r3"><mxGeometry x="40" width="160" height="30" as="geometry"/></mxCell>

    <!-- STOREMEMBERS table -->
    <mxCell id="tSM" value="StoreMembers" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1"><mxGeometry x="190" y="290" width="220" height="120" as="geometry"/></mxCell>
    <mxCell id="sm_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tSM"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r1L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="sm_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r1R" value="UserId (GUID)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tSM"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="sm_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r2R" value="StoreId (GUID)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tSM"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r3R" value="Role (Owner/Manager/Employee)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- PRODUCTS table -->
    <mxCell id="tProd" value="Products" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="640" y="280" width="220" height="180" as="geometry"/></mxCell>
    <mxCell id="pr_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tProd"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="pr_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r1R" value="Id (GUID)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="pr_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r2R" value="StoreId" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r3R" value="Name, SKU, Category" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="120" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r4R" value="Price, StockQuantity" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r4"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="150" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r5R" value="LowStockThreshold, IsActive" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r5"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- ORDERS table -->
    <mxCell id="tOrders" value="Orders" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="640" y="540" width="220" height="150" as="geometry"/></mxCell>
    <mxCell id="or_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tOrders"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="or_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r1R" value="Id (GUID)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="or_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r2R" value="StoreId, CustomerId" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r3R" value="TotalAmount, Discount" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="120" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r4R" value="CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r4"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- ORDERITEMS table -->
    <mxCell id="tOI" value="OrderItems" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="960" y="430" width="220" height="120" as="geometry"/></mxCell>
    <mxCell id="oi_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tOI"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r1L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="oi_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r1R" value="OrderId" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOI"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="oi_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r2R" value="ProductId" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOI"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r3R" value="Quantity, UnitPrice" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- CUSTOMERS table -->
    <mxCell id="tCust" value="Customers" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1"><mxGeometry x="330" y="540" width="220" height="150" as="geometry"/></mxCell>
    <mxCell id="cu_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tCust"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="cu_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r1R" value="Id (GUID)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="cu_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r2R" value="StoreId" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r3R" value="Name, Phone, Email" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="120" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r4R" value="RfmSegment, TotalSpent" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r4"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- INVENTORYALERTS table -->
    <mxCell id="tAlerts" value="InventoryAlerts" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="960" y="280" width="220" height="120" as="geometry"/></mxCell>
    <mxCell id="al_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tAlerts"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r1L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="al_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r1R" value="ProductId, StoreId" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tAlerts"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r2L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r2R" value="Type, Severity, Message" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tAlerts"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r3R" value="IsRead, CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- FORECASTS table -->
    <mxCell id="tForecasts" value="Forecasts" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="960" y="590" width="220" height="120" as="geometry"/></mxCell>
    <mxCell id="fc_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tForecasts"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r1L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="fc_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r1R" value="ProductId, StoreId" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tForecasts"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r2L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r2R" value="ForecastJson, ModelUsed" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tForecasts"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r3R" value="GeneratedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- RELATIONSHIPS (edges between row ports) -->
    <!-- Users 1:N StoreMembers -->
    <mxCell id="rel_usm" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="u_r1" target="sm_r1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N StoreMembers -->
    <mxCell id="rel_ssm" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="s_r1" target="sm_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Products -->
    <mxCell id="rel_sp" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="s_r2" target="pr_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Orders -->
    <mxCell id="rel_so" value="1" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="or_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Customers -->
    <mxCell id="rel_sc" value="1" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r2" target="cu_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Orders 1:N OrderItems -->
    <mxCell id="rel_ooi" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.3;entryDx=0;entryDy=0;" edge="1" source="or_r1" target="oi_r1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Products 1:N OrderItems -->
    <mxCell id="rel_poi" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.6;entryDx=0;entryDy=0;" edge="1" source="pr_r1" target="oi_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Products 1:N InventoryAlerts -->
    <mxCell id="rel_pal" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=1;exitY=0.3;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="pr_r1" target="al_r1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Products 1:N Forecasts -->
    <mxCell id="rel_pfc" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=1;exitY=0.7;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="pr_r1" target="fc_r1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Customers 1:N Orders -->
    <mxCell id="rel_co" value="1" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.7;entryDx=0;entryDy=0;" edge="1" source="cu_r1" target="or_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 5. USE CASE DIAGRAM
# ─────────────────────────────────────────────────────────────────────────────
usecase = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="900" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Use Case Diagram" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="400" y="20" width="600" height="40" as="geometry"/></mxCell>

    <!-- System Boundary -->
    <mxCell id="boundary" value="SellWise System" style="swimlane;startSize=30;fillColor=none;strokeColor=#6c8ebf;fontSize=14;fontStyle=1;dashed=1;" vertex="1" parent="1"><mxGeometry x="200" y="80" width="900" height="760" as="geometry"/></mxCell>

    <!-- Actors (stick figures using ellipse+lines concept, we use the built-in actor shape) -->
    <mxCell id="owner" value="Owner" style="shape=mxgraph.flowchart.start_2;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="200" width="50" height="70" as="geometry"/></mxCell>
    <mxCell id="ownerLbl" value="Owner" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="25" y="275" width="80" height="20" as="geometry"/></mxCell>

    <mxCell id="manager" value="Manager" style="shape=mxgraph.flowchart.start_2;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="460" width="50" height="70" as="geometry"/></mxCell>
    <mxCell id="managerLbl" value="Manager" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="20" y="535" width="90" height="20" as="geometry"/></mxCell>

    <mxCell id="employee" value="Employee" style="shape=mxgraph.flowchart.start_2;fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="40" y="680" width="50" height="70" as="geometry"/></mxCell>
    <mxCell id="employeeLbl" value="Employee" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="20" y="755" width="90" height="20" as="geometry"/></mxCell>

    <!-- Use Cases (ellipses inside boundary) -->
    <mxCell id="uc_login" value="Login / Register" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="100" y="40" width="160" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_dashboard" value="View Dashboard &amp; KPIs" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="350" y="40" width="180" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_forecast" value="View Demand Forecast" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="620" y="40" width="180" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_switch" value="Switch / Create Store" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="100" y="140" width="160" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_staff" value="Manage Staff (Invite/Remove)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="350" y="140" width="200" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_report" value="Generate PDF Reports" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="640" y="140" width="170" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_products" value="Manage Products (CRUD)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="100" y="280" width="170" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_inventory" value="View Inventory Alerts" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="360" y="280" width="170" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_orders" value="Process POS Orders" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="620" y="280" width="170" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_customers" value="Manage Customers" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="100" y="420" width="160" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_rfm" value="View RFM Segments" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="360" y="420" width="160" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_expenses" value="Track Expenses" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="620" y="420" width="160" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_catalog" value="View Product Catalog" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="100" y="570" width="170" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_pos" value="Add Items to Cart" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="360" y="570" width="170" height="50" as="geometry"/></mxCell>

    <!-- Actor associations (lines from actors to use cases) - note: actors are outside boundary, use cases inside -->
    <!-- Owner lines -->
    <mxCell id="a_ol1" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_login" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ol2" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_dashboard" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ol3" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_switch" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ol4" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_staff" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ol5" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_report" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ol6" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_forecast" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Manager lines -->
    <mxCell id="a_ml1" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_login" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ml2" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_products" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ml3" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_inventory" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ml4" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_orders" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ml5" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_customers" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ml6" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_rfm" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ml7" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_expenses" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Employee lines -->
    <mxCell id="a_el1" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_login" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_el2" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_catalog" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_el3" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_pos" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_el4" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_orders" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 6. ACTIVITY DIAGRAM (Order Creation)
# ─────────────────────────────────────────────────────────────────────────────
activity = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="800" pageHeight="1200" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Activity Diagram: Order Creation" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="100" y="20" width="600" height="40" as="geometry"/></mxCell>

    <!-- Start -->
    <mxCell id="start" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;strokeColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="350" y="80" width="50" height="50" as="geometry"/></mxCell>

    <!-- Action: Navigate to Orders -->
    <mxCell id="a1" value="User Navigates to Orders Section" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="170" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Click Create Order -->
    <mxCell id="a2" value="Click 'Create Order'" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="260" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Search and Add Products to Cart -->
    <mxCell id="a3" value="Search Products &amp; Add to Cart" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="350" width="300" height="50" as="geometry"/></mxCell>

    <!-- Decision: More Items? -->
    <mxCell id="d1" value="More items to add?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;" vertex="1" parent="1"><mxGeometry x="250" y="440" width="250" height="70" as="geometry"/></mxCell>

    <!-- Action: Select Customer -->
    <mxCell id="a4" value="Select Customer (Optional)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="560" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Apply Discount -->
    <mxCell id="a5" value="Apply Discount (Optional)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="650" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Submit Order -->
    <mxCell id="a6" value="Submit Order (POST /Orders/Create)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="740" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Begin DB Transaction -->
    <mxCell id="a7" value="System: Begin Database Transaction" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="830" width="300" height="50" as="geometry"/></mxCell>

    <!-- Decision: Sufficient Stock? -->
    <mxCell id="d2" value="Stock sufficient for all items?" style="rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="930" width="300" height="70" as="geometry"/></mxCell>

    <!-- Action: Rollback -->
    <mxCell id="a8" value="Rollback Transaction&#xa;Show 'Insufficient Stock' Error" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;" vertex="1" parent="1"><mxGeometry x="620" y="930" width="200" height="60" as="geometry"/></mxCell>

    <!-- Action: Deduct Stock -->
    <mxCell id="a9" value="Deduct Stock &amp; Save Order" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="1050" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Commit Transaction -->
    <mxCell id="a10" value="Commit Transaction" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="1140" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Scan Inventory Alerts -->
    <mxCell id="a11" value="Scan &amp; Update Inventory Alerts" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="1230" width="300" height="50" as="geometry"/></mxCell>

    <!-- Action: Update RFM -->
    <mxCell id="a12" value="Update Customer RFM Score" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1d5e7;strokeColor=#9673a6;fontSize=12;" vertex="1" parent="1"><mxGeometry x="225" y="1320" width="300" height="50" as="geometry"/></mxCell>

    <!-- End -->
    <mxCell id="end" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#000000;strokeColor=#ffffff;" vertex="1" parent="1"><mxGeometry x="350" y="1420" width="50" height="50" as="geometry"/></mxCell>
    <mxCell id="endRing" value="" style="ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=none;strokeColor=#000000;strokeWidth=3;" vertex="1" parent="1"><mxGeometry x="342" y="1412" width="66" height="66" as="geometry"/></mxCell>

    <!-- Edges -->
    <mxCell id="e_s1" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="start" target="a1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_12" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a1" target="a2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_23" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a2" target="a3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_3d1" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a3" target="d1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_d1yes" value="Yes" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;" edge="1" source="d1" target="a3" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="600" y="475"/><mxPoint x="600" y="375"/></Array></mxGeometry></mxCell>
    <mxCell id="e_d1no" value="No" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" edge="1" source="d1" target="a4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_45" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a4" target="a5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_56" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a5" target="a6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_67" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a6" target="a7" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_7d2" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a7" target="d2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_d2no" value="No (Insufficient)" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="d2" target="a8" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_d2yes" value="Yes" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;" edge="1" source="d2" target="a9" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_9_10" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a9" target="a10" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_10_11" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a10" target="a11" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_11_12" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a11" target="a12" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_12end" style="edgeStyle=orthogonalEdgeStyle;html=1;" edge="1" source="a12" target="end" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="e_8back" value="Back to form" style="edgeStyle=orthogonalEdgeStyle;html=1;exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;" edge="1" source="a8" target="a6" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="720" y="1040"/><mxPoint x="525" y="1040"/></Array></mxGeometry></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 7. SEQUENCE DIAGRAM (Dashboard Load)
# ─────────────────────────────────────────────────────────────────────────────
sequence = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="1000" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Sequence Diagram: Dashboard Load &amp; Forecast" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="100" y="20" width="1000" height="40" as="geometry"/></mxCell>

    <!-- Lifeline headers -->
    <mxCell id="h_browser" value="Browser (User)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="60" y="80" width="130" height="50" as="geometry"/></mxCell>
    <mxCell id="h_controller" value="Dashboard Controller" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="260" y="80" width="150" height="50" as="geometry"/></mxCell>
    <mxCell id="h_analytics" value="Analytics Service" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="490" y="80" width="140" height="50" as="geometry"/></mxCell>
    <mxCell id="h_db" value="SQL Database" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="710" y="80" width="130" height="50" as="geometry"/></mxCell>
    <mxCell id="h_ml" value="Python ML Service" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="930" y="80" width="140" height="50" as="geometry"/></mxCell>

    <!-- Lifelines (vertical dashed lines) -->
    <mxCell id="ll_browser" style="edgeStyle=none;html=1;dashed=1;endArrow=none;startArrow=none;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="125" y="130"/><mxPoint x="125" y="960"/></Array></mxGeometry></mxCell>
    <mxCell id="ll_ctrl" style="edgeStyle=none;html=1;dashed=1;endArrow=none;startArrow=none;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="335" y="130"/><mxPoint x="335" y="960"/></Array></mxGeometry></mxCell>
    <mxCell id="ll_ana" style="edgeStyle=none;html=1;dashed=1;endArrow=none;startArrow=none;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="130"/><mxPoint x="560" y="960"/></Array></mxGeometry></mxCell>
    <mxCell id="ll_db" style="edgeStyle=none;html=1;dashed=1;endArrow=none;startArrow=none;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="775" y="130"/><mxPoint x="775" y="960"/></Array></mxGeometry></mxCell>
    <mxCell id="ll_ml" style="edgeStyle=none;html=1;dashed=1;endArrow=none;startArrow=none;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="1000" y="130"/><mxPoint x="1000" y="960"/></Array></mxGeometry></mxCell>

    <!-- Messages (arrows) -->
    <!-- 1: Browser -> Controller: GET /Dashboard -->
    <mxCell id="m1" value="1: GET /Dashboard" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="125" y="180"/><mxPoint x="335" y="180"/></Array></mxGeometry></mxCell>
    <!-- 2: Controller -> Analytics: GetOverview(storeId) -->
    <mxCell id="m2" value="2: GetOverview(storeId)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="335" y="230"/><mxPoint x="560" y="230"/></Array></mxGeometry></mxCell>
    <!-- 3: Analytics -> DB: Get Top 6 Products by Qty -->
    <mxCell id="m3" value="3: Query top 6 products by sales qty" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="280"/><mxPoint x="775" y="280"/></Array></mxGeometry></mxCell>
    <!-- 4: DB -> Analytics: ProductList -->
    <mxCell id="m4" value="4: ProductList" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="775" y="310"/><mxPoint x="560" y="310"/></Array></mxGeometry></mxCell>
    <!-- 5: Analytics -> DB: Check Forecast Cache (<24h?) -->
    <mxCell id="m5" value="5: Check Forecasts table (is cache &lt; 24h?)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="360"/><mxPoint x="775" y="360"/></Array></mxGeometry></mxCell>
    <!-- 6a: Cache HIT -->
    <mxCell id="m6a" value="6a: [Cache HIT] Return cached forecast" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="775" y="400"/><mxPoint x="560" y="400"/></Array></mxGeometry></mxCell>
    <!-- 6b: Cache MISS -->
    <mxCell id="m6b" value="6b: [Cache MISS] Get 90-day order history" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="450"/><mxPoint x="775" y="450"/></Array></mxGeometry></mxCell>
    <mxCell id="m6br" value="6b-r: OrderItem history" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="775" y="480"/><mxPoint x="560" y="480"/></Array></mxGeometry></mxCell>
    <!-- 7: Analytics -> ML: POST /api/v1/ml/forecast -->
    <mxCell id="m7" value="7: POST /api/v1/ml/forecast (history)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="540"/><mxPoint x="1000" y="540"/></Array></mxGeometry></mxCell>
    <!-- 8: ML processes Prophet -->
    <mxCell id="m8box" value="Prophet model.fit(df) + predict 30 days" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=10;" vertex="1" parent="1"><mxGeometry x="930" y="580" width="180" height="40" as="geometry"/></mxCell>
    <!-- 9: ML -> Analytics: ForecastResult -->
    <mxCell id="m9" value="9: ForecastResult (yhat, yhat_lower, yhat_upper)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="1000" y="640"/><mxPoint x="560" y="640"/></Array></mxGeometry></mxCell>
    <!-- Fallback note -->
    <mxCell id="fallback" value="alt: [ML timeout/error] -> Fallback to EWMA moving average" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;fontSize=10;dashed=1;" vertex="1" parent="1"><mxGeometry x="490" y="660" width="280" height="40" as="geometry"/></mxCell>
    <!-- 10: Analytics -> DB: Save forecast to cache -->
    <mxCell id="m10" value="10: Save forecast to Forecasts table" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="730"/><mxPoint x="775" y="730"/></Array></mxGeometry></mxCell>
    <mxCell id="m10r" value="10-r: OK" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="775" y="760"/><mxPoint x="560" y="760"/></Array></mxGeometry></mxCell>
    <!-- 11: Analytics -> DB: Calculate Revenue, Health Score -->
    <mxCell id="m11" value="11: Compute revenue growth, health score, RFM" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="810"/><mxPoint x="775" y="810"/></Array></mxGeometry></mxCell>
    <mxCell id="m11r" value="11-r: KPI data" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="775" y="840"/><mxPoint x="560" y="840"/></Array></mxGeometry></mxCell>
    <!-- 12: Analytics -> Controller: DashboardViewModel -->
    <mxCell id="m12" value="12: DashboardViewModel" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="560" y="890"/><mxPoint x="335" y="890"/></Array></mxGeometry></mxCell>
    <!-- 13: Controller -> Browser: Render Dashboard HTML -->
    <mxCell id="m13" value="13: Render Dashboard View (HTML + Charts)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><Array as="points"><mxPoint x="335" y="930"/><mxPoint x="125" y="930"/></Array></mxGeometry></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 8. CLASS DIAGRAM
# ─────────────────────────────────────────────────────────────────────────────
classdiag = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1400" pageHeight="1000" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Class Diagram" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="400" y="20" width="600" height="40" as="geometry"/></mxCell>

    <!-- BaseController -->
    <mxCell id="BaseCtrl" value="&lt;&lt;abstract&gt;&gt;&#xa;BaseController" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="450" y="80" width="260" height="210" as="geometry"/></mxCell>
    <mxCell id="bc_sep1" value="Properties" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#dae8fc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="BaseCtrl"><mxGeometry y="40" width="260" height="20" as="geometry"/></mxCell>
    <mxCell id="bc_p1" value="- _db: AppDbContext" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="60" width="260" height="25" as="geometry"/></mxCell>
    <mxCell id="bc_p2" value="- _userManager: UserManager" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="85" width="260" height="25" as="geometry"/></mxCell>
    <mxCell id="bc_sep2" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#dae8fc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="BaseCtrl"><mxGeometry y="110" width="260" height="20" as="geometry"/></mxCell>
    <mxCell id="bc_m1" value="+ GetCurrentStoreId(): Guid" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="130" width="260" height="25" as="geometry"/></mxCell>
    <mxCell id="bc_m2" value="+ GetCurrentUserAsync(): Task&lt;User&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="155" width="260" height="25" as="geometry"/></mxCell>
    <mxCell id="bc_m3" value="# IsStoreMember(storeId): bool" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="180" width="260" height="25" as="geometry"/></mxCell>

    <!-- DashboardController -->
    <mxCell id="DashCtrl" value="DashboardController" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="60" y="380" width="250" height="130" as="geometry"/></mxCell>
    <mxCell id="dc_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#d5e8d4;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="DashCtrl"><mxGeometry y="40" width="250" height="20" as="geometry"/></mxCell>
    <mxCell id="dc_m1" value="+ Index(): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="DashCtrl"><mxGeometry y="60" width="250" height="25" as="geometry"/></mxCell>
    <mxCell id="dc_m2" value="+ GetChartData(): Task&lt;JsonResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="DashCtrl"><mxGeometry y="85" width="250" height="25" as="geometry"/></mxCell>
    <mxCell id="dc_m3" value="- _analyticsService: IAnalyticsService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="DashCtrl"><mxGeometry y="110" width="250" height="25" as="geometry"/></mxCell>

    <!-- OrderController -->
    <mxCell id="OrdCtrl" value="OrderController" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="380" y="380" width="250" height="160" as="geometry"/></mxCell>
    <mxCell id="oc_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#d5e8d4;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="OrdCtrl"><mxGeometry y="40" width="250" height="20" as="geometry"/></mxCell>
    <mxCell id="oc_m1" value="+ Index(): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdCtrl"><mxGeometry y="60" width="250" height="25" as="geometry"/></mxCell>
    <mxCell id="oc_m2" value="+ Create(vm): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdCtrl"><mxGeometry y="85" width="250" height="25" as="geometry"/></mxCell>
    <mxCell id="oc_m3" value="+ Details(id): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdCtrl"><mxGeometry y="110" width="250" height="25" as="geometry"/></mxCell>
    <mxCell id="oc_m4" value="- _orderService: IOrderService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdCtrl"><mxGeometry y="135" width="250" height="25" as="geometry"/></mxCell>

    <!-- ProductController -->
    <mxCell id="ProdCtrl" value="ProductController" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="700" y="380" width="250" height="130" as="geometry"/></mxCell>
    <mxCell id="pc_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#d5e8d4;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="ProdCtrl"><mxGeometry y="40" width="250" height="20" as="geometry"/></mxCell>
    <mxCell id="pc_m1" value="+ Index(): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdCtrl"><mxGeometry y="60" width="250" height="25" as="geometry"/></mxCell>
    <mxCell id="pc_m2" value="+ Create/Edit/Delete(...)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdCtrl"><mxGeometry y="85" width="250" height="25" as="geometry"/></mxCell>
    <mxCell id="pc_m3" value="+ ImportCsv(file): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdCtrl"><mxGeometry y="110" width="250" height="25" as="geometry"/></mxCell>

    <!-- AnalyticsService -->
    <mxCell id="AnaServ" value="AnalyticsService" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="60" y="620" width="280" height="160" as="geometry"/></mxCell>
    <mxCell id="as_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#fff2cc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="AnaServ"><mxGeometry y="40" width="280" height="20" as="geometry"/></mxCell>
    <mxCell id="as_m1" value="+ GetOverviewAsync(storeId): Task&lt;DashVM&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="60" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="as_m2" value="+ GetRevenueAsync(storeId, days): decimal" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="85" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="as_m3" value="- PadHistoryWithZeros(history): List" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="110" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="as_m4" value="- _forecastService: IForecastService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="135" width="280" height="25" as="geometry"/></mxCell>

    <!-- ForecastService -->
    <mxCell id="FcServ" value="ForecastService" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="420" y="620" width="280" height="130" as="geometry"/></mxCell>
    <mxCell id="fs_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#fff2cc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="FcServ"><mxGeometry y="40" width="280" height="20" as="geometry"/></mxCell>
    <mxCell id="fs_m1" value="+ GetForecastAsync(req): Task&lt;ForecastResp&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="FcServ"><mxGeometry y="60" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="fs_m2" value="- _httpClient: HttpClient (timeout 5s)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="FcServ"><mxGeometry y="85" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="fs_m3" value="- BaseUrl: http://localhost:8000" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="FcServ"><mxGeometry y="110" width="280" height="25" as="geometry"/></mxCell>

    <!-- OrderService -->
    <mxCell id="OrdServ" value="OrderService" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="780" y="620" width="280" height="130" as="geometry"/></mxCell>
    <mxCell id="os_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#fff2cc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="OrdServ"><mxGeometry y="40" width="280" height="20" as="geometry"/></mxCell>
    <mxCell id="os_m1" value="+ CreateOrderAsync(vm): Task&lt;Order&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdServ"><mxGeometry y="60" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="os_m2" value="- ValidateAndDeductStock(items, tx)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdServ"><mxGeometry y="85" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="os_m3" value="- _alertService: IAlertService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdServ"><mxGeometry y="110" width="280" height="25" as="geometry"/></mxCell>

    <!-- RfmService -->
    <mxCell id="RfmServ" value="RfmService" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="60" y="850" width="280" height="110" as="geometry"/></mxCell>
    <mxCell id="rfm_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#e1d5e7;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="RfmServ"><mxGeometry y="40" width="280" height="20" as="geometry"/></mxCell>
    <mxCell id="rfm_m1" value="+ ComputeRfmAsync(storeId): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="RfmServ"><mxGeometry y="60" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="rfm_m2" value="- CalculateScore(R, F, M): string" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="RfmServ"><mxGeometry y="85" width="280" height="25" as="geometry"/></mxCell>

    <!-- AlertService -->
    <mxCell id="AltServ" value="AlertService" style="shape=table;startSize=40;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="420" y="850" width="280" height="110" as="geometry"/></mxCell>
    <mxCell id="alt_sep" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#e1d5e7;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="AltServ"><mxGeometry y="40" width="280" height="20" as="geometry"/></mxCell>
    <mxCell id="alt_m1" value="+ ScanAndGenerateAlertsAsync(storeId)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AltServ"><mxGeometry y="60" width="280" height="25" as="geometry"/></mxCell>
    <mxCell id="alt_m2" value="- ResolveHealthyAlerts(storeId)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AltServ"><mxGeometry y="85" width="280" height="25" as="geometry"/></mxCell>

    <!-- RELATIONSHIPS -->
    <!-- BaseCtrl <|-- DashCtrl -->
    <mxCell id="inh1" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;startArrow=none;startFill=0;" edge="1" source="DashCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- BaseCtrl <|-- OrdCtrl -->
    <mxCell id="inh2" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;startArrow=none;startFill=0;" edge="1" source="OrdCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- BaseCtrl <|-- ProdCtrl -->
    <mxCell id="inh3" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;startArrow=none;startFill=0;" edge="1" source="ProdCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- DashCtrl uses AnalyticsService -->
    <mxCell id="use1" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;startArrow=none;" edge="1" source="DashCtrl" target="AnaServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- OrdCtrl uses OrderService -->
    <mxCell id="use2" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;startArrow=none;" edge="1" source="OrdCtrl" target="OrdServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- AnalyticsService uses ForecastService -->
    <mxCell id="use3" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;startArrow=none;" edge="1" source="AnaServ" target="FcServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- OrderService uses AlertService -->
    <mxCell id="use4" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;startArrow=none;" edge="1" source="OrdServ" target="AltServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- AnalyticsService uses RfmService -->
    <mxCell id="use5" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;startArrow=none;" edge="1" source="AnaServ" target="RfmServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# Write all files
files = {
    "01_Gantt_Chart.drawio": gantt,
    "02_DFD_Level0.drawio": dfd0,
    "03_DFD_Level1.drawio": dfd1,
    "04_ER_Diagram.drawio": er,
    "05_Use_Case_Diagram.drawio": usecase,
    "06_Activity_Diagram.drawio": activity,
    "07_Sequence_Diagram.drawio": sequence,
    "08_Class_Diagram.drawio": classdiag,
}

for filename, content in files.items():
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("OK: " + filename)

print("\nAll 8 diagram files generated successfully!")
print("Location: " + OUT_DIR)
