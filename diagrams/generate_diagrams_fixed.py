#!/usr/bin/env python3
"""
Generate CORRECTED SellWise draw.io diagrams.
Fixes applied after code audit of actual source files.
Only regenerates diagrams 03, 04, 05, 08 (the ones with errors).
"""

import os

OUT_DIR = r"C:\Users\mrsoh\SDP\diagrams"
os.makedirs(OUT_DIR, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 03 — DFD LEVEL 1 (FIXED: added D6 Expenses, added Expense tracking process)
# ─────────────────────────────────────────────────────────────────────────────
dfd1 = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1000" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - DFD Level 1 (Process Decomposition) [Corrected]" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="200" y="20" width="1000" height="40" as="geometry"/></mxCell>

    <!-- External Entities -->
    <mxCell id="user" value="User&#xa;(Owner / Manager / Employee)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="30" y="460" width="155" height="60" as="geometry"/></mxCell>
    <mxCell id="mlsvc" value="Python ML Service&#xa;(Prophet / EWMA)" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="1350" y="630" width="155" height="60" as="geometry"/></mxCell>

    <!-- DATA STORES (D1-D6) -->
    <mxCell id="ds1" value="D1: AspNetUsers&#xa;(ApplicationUser / Identity)" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="60" width="175" height="65" as="geometry"/></mxCell>
    <mxCell id="ds2" value="D2: StoreMembers" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="175" width="175" height="60" as="geometry"/></mxCell>
    <mxCell id="ds3" value="D3: Products" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="285" width="175" height="60" as="geometry"/></mxCell>
    <mxCell id="ds4" value="D4: Orders / OrderItems" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="395" width="175" height="60" as="geometry"/></mxCell>
    <mxCell id="ds5" value="D5: Customers" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="505" width="175" height="60" as="geometry"/></mxCell>
    <mxCell id="ds6" value="D6: Expenses" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="615" width="175" height="60" as="geometry"/></mxCell>
    <mxCell id="ds7" value="D7: InventoryAlerts" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="725" width="175" height="60" as="geometry"/></mxCell>
    <mxCell id="ds8" value="D8: Forecasts Cache" style="shape=mxgraph.flowchart.database;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=10;" vertex="1" parent="1"><mxGeometry x="820" y="835" width="175" height="60" as="geometry"/></mxCell>

    <!-- PROCESSES -->
    <mxCell id="p1" value="1.0&#xa;Authenticate User&#xa;(AuthController)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="420" y="55" width="175" height="75" as="geometry"/></mxCell>
    <mxCell id="p2" value="2.0&#xa;Manage Products&#xa;&amp; Inventory&#xa;(ProductController)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="420" y="180" width="175" height="80" as="geometry"/></mxCell>
    <mxCell id="p3" value="3.0&#xa;Process POS Orders&#xa;(OrderController)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="420" y="315" width="175" height="75" as="geometry"/></mxCell>
    <mxCell id="p4" value="4.0&#xa;Manage Customers&#xa;&amp; RFM&#xa;(CustomerController)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="420" y="445" width="175" height="80" as="geometry"/></mxCell>
    <mxCell id="p5" value="5.0&#xa;Track Expenses&#xa;(ExpenseController)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="420" y="580" width="175" height="75" as="geometry"/></mxCell>
    <mxCell id="p6" value="6.0&#xa;Analytics &amp; Forecasting&#xa;(DashboardController&#xa;/ AnalyticsService)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="420" y="710" width="175" height="90" as="geometry"/></mxCell>
    <mxCell id="p7" value="7.0&#xa;Generate PDF Reports&#xa;(ReportController)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="1"><mxGeometry x="420" y="860" width="175" height="75" as="geometry"/></mxCell>

    <!-- User to Processes -->
    <mxCell id="u1" value="Credentials" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="user" target="p1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u2" value="Product data" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="user" target="p2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u3" value="Cart / Order" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="user" target="p3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u4" value="Customer info" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="user" target="p4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u5" value="Expense entry" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="user" target="p5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u6" value="Dashboard request" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="user" target="p6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="u7" value="Report request" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="user" target="p7" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>

    <!-- Processes to Data Stores -->
    <mxCell id="p1d1" value="Read/write session" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p1" target="ds1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p1d2" value="Check store membership" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p1" target="ds2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p2d3" value="CRUD products / stock" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p2" target="ds3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3d4" value="Write order (transaction)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p3" target="ds4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3d3" value="Deduct stock" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p3" target="ds3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p3d7" value="Trigger alert scan" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p3" target="ds7" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p4d5" value="Update RFM scores" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p4" target="ds5" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p5d6" value="CRUD expenses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p5" target="ds6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p6d4" value="Read order history (90d)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p6" target="ds4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p6d8" value="Cache forecast (24h TTL)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p6" target="ds8" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p6d6" value="Read expenses for P&amp;L" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p6" target="ds6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p7d4" value="Read orders for PDF" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p7" target="ds4" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>

    <!-- P6 ML flows -->
    <mxCell id="p6ml1" value="90-day sales history (per product)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;" edge="1" source="p6" target="mlsvc" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p6ml2" value="30-day Prophet forecast (yhat)" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="mlsvc" target="p6" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>

    <!-- Outputs back to user -->
    <mxCell id="p6u" value="KPIs, charts, alerts, forecasts" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="p6" target="user" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p7u" value="PDF file download" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="p7" target="user" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="p1u" value="Session cookie / redirect" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="p1" target="user" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 04 — ER DIAGRAM (FIXED: all model errors corrected, Expenses added)
# ─────────────────────────────────────────────────────────────────────────────
er = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1800" pageHeight="1100" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Entity Relationship Diagram (ERD) [Corrected]" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="450" y="20" width="900" height="40" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         ApplicationUser  (ASP.NET Identity)
         NOTE: actual PK is string (IdentityUser.Id)
         ══════════════════════════════════════ -->
    <mxCell id="tUser" value="ApplicationUser (AspNetUsers)" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="40" y="80" width="230" height="180" as="geometry"/></mxCell>
    <mxCell id="u_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tUser"><mxGeometry y="30" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="u_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r1R" value="Id (string - Identity)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r1"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tUser"><mxGeometry y="60" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r2L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r2R" value="Email (Identity)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r2"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tUser"><mxGeometry y="90" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r3R" value="PasswordHash (Identity)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r3"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tUser"><mxGeometry y="120" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r4R" value="OwnerName (custom)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r4"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tUser"><mxGeometry y="150" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="u_r5R" value="UserName, PhoneNumber (Identity)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="u_r5"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         Stores  (NO OwnerId — ownership via StoreMembers)
         ══════════════════════════════════════ -->
    <mxCell id="tStores" value="Stores" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="360" y="80" width="220" height="180" as="geometry"/></mxCell>
    <mxCell id="s_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tStores"><mxGeometry y="30" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="s_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r1"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tStores"><mxGeometry y="60" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r2L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r2R" value="Name" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r2"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tStores"><mxGeometry y="90" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r3R" value="BusinessType" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r3"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tStores"><mxGeometry y="120" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r4R" value="Currency (default: BDT)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r4"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tStores"><mxGeometry y="150" width="220" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="s_r5R" value="Timezone, CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="s_r5"><mxGeometry x="40" width="180" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         StoreMembers  (junction - UserId is string to match Identity)
         ══════════════════════════════════════ -->
    <mxCell id="tSM" value="StoreMembers" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1"><mxGeometry x="200" y="330" width="230" height="120" as="geometry"/></mxCell>
    <mxCell id="sm_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tSM"><mxGeometry y="30" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r1L" value="PK,FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="sm_r1"><mxGeometry width="50" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r1R" value="UserId (string -> ApplicationUser)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r1"><mxGeometry x="50" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tSM"><mxGeometry y="60" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r2L" value="PK,FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="sm_r2"><mxGeometry width="50" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r2R" value="StoreId (Guid -> Stores)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r2"><mxGeometry x="50" width="180" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tSM"><mxGeometry y="90" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="sm_r3R" value="Role (owner/manager/employee)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="sm_r3"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         Products (has CostPrice + SellingPrice, Unit)
         ══════════════════════════════════════ -->
    <mxCell id="tProd" value="Products" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="680" y="310" width="230" height="240" as="geometry"/></mxCell>
    <mxCell id="pr_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tProd"><mxGeometry y="30" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="pr_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r1"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="60" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="pr_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r2R" value="StoreId (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r2"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="90" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r3R" value="Name, Sku, Category" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r3"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="120" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r4R" value="CostPrice, SellingPrice" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r4"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="150" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r5R" value="StockQuantity, LowStockThreshold" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r5"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r6" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tProd"><mxGeometry y="180" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r6L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r6"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="pr_r6R" value="Unit, IsActive, CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="pr_r6"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         Orders (correct field names: Total not TotalAmount)
         ══════════════════════════════════════ -->
    <mxCell id="tOrders" value="Orders" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="680" y="620" width="230" height="240" as="geometry"/></mxCell>
    <mxCell id="or_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tOrders"><mxGeometry y="30" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="or_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r1"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="60" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="or_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r2R" value="StoreId (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r2"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="90" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r3L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="or_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r3R" value="CustomerId (Guid, nullable)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r3"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="120" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r4R" value="OrderNumber, Status" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r4"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="150" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r5R" value="Total, Discount, DeliveryCharge" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r5"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r6" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOrders"><mxGeometry y="180" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r6L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r6"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="or_r6R" value="OrderDate, Notes, CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="or_r6"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         OrderItems (ProductId is NULLABLE, has denorm ProductName + CostPrice)
         ══════════════════════════════════════ -->
    <mxCell id="tOI" value="OrderItems" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="1060" y="500" width="250" height="210" as="geometry"/></mxCell>
    <mxCell id="oi_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tOI"><mxGeometry y="30" width="250" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="oi_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r1"><mxGeometry x="40" width="210" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOI"><mxGeometry y="60" width="250" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="oi_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r2R" value="OrderId (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r2"><mxGeometry x="40" width="210" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOI"><mxGeometry y="90" width="250" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r3L" value="FK?" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="oi_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r3R" value="ProductId (Guid, NULLABLE)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r3"><mxGeometry x="40" width="210" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOI"><mxGeometry y="120" width="250" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r4R" value="ProductName (denormalized copy)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r4"><mxGeometry x="40" width="210" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOI"><mxGeometry y="150" width="250" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r5R" value="Quantity, UnitPrice, CostPrice" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r5"><mxGeometry x="40" width="210" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r6" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tOI"><mxGeometry y="180" width="250" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r6L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r6"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="oi_r6R" value="CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="oi_r6"><mxGeometry x="40" width="210" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         Customers (full fields including RFM scores)
         ══════════════════════════════════════ -->
    <mxCell id="tCust" value="Customers" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#f8cecc;strokeColor=#b85450;" vertex="1" parent="1"><mxGeometry x="340" y="590" width="240" height="270" as="geometry"/></mxCell>
    <mxCell id="cu_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tCust"><mxGeometry y="30" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="cu_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r1"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="60" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="cu_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r2R" value="StoreId (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r2"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="90" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r3R" value="Name, Phone, Email, Address" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r3"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="120" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r4R" value="TotalOrders, TotalSpent" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r4"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="150" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r5R" value="LastOrderDate" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r5"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r6" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="180" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r6L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r6"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r6R" value="RecencyScore, FrequencyScore, MonetaryScore" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r6"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r7" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="210" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r7L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r7"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r7R" value="RfmSegment (Champion/Loyal/...)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r7"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r8" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tCust"><mxGeometry y="240" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r8L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r8"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="cu_r8R" value="CreatedAt, UpdatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="cu_r8"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         InventoryAlerts
         ══════════════════════════════════════ -->
    <mxCell id="tAlerts" value="InventoryAlerts" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="1060" y="310" width="240" height="180" as="geometry"/></mxCell>
    <mxCell id="al_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tAlerts"><mxGeometry y="30" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="al_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r1"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tAlerts"><mxGeometry y="60" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="al_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r2R" value="StoreId (Guid), ProductId (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r2"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tAlerts"><mxGeometry y="90" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r3R" value="Type, Severity, Message" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r3"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tAlerts"><mxGeometry y="120" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="al_r4R" value="IsRead, CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="al_r4"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         Forecasts (FIXED: TargetDate, PredictedDemand, LowerBound, UpperBound)
         ══════════════════════════════════════ -->
    <mxCell id="tForecast" value="Forecasts" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="1060" y="80" width="240" height="210" as="geometry"/></mxCell>
    <mxCell id="fc_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tForecast"><mxGeometry y="30" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="fc_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r1"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tForecast"><mxGeometry y="60" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="fc_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r2R" value="StoreId (Guid), ProductId (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r2"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tForecast"><mxGeometry y="90" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r3R" value="TargetDate (DateTime)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r3"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tForecast"><mxGeometry y="120" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r4R" value="PredictedDemand (double)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r4"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tForecast"><mxGeometry y="150" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r5R" value="LowerBound, UpperBound (double)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r5"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r6" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tForecast"><mxGeometry y="180" width="240" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r6L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r6"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="fc_r6R" value="ModelUsed, CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="fc_r6"><mxGeometry x="40" width="200" height="30" as="geometry"/></mxCell>

    <!-- ══════════════════════════════════════
         Expenses (ADDED - was missing)
         ══════════════════════════════════════ -->
    <mxCell id="tExp" value="Expenses" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#ffe6cc;strokeColor=#d79b00;" vertex="1" parent="1"><mxGeometry x="40" y="590" width="230" height="180" as="geometry"/></mxCell>
    <mxCell id="ex_r1" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=1;" vertex="1" parent="tExp"><mxGeometry y="30" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r1L" value="PK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="ex_r1"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r1R" value="Id (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r1"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r2" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tExp"><mxGeometry y="60" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r2L" value="FK" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;fontStyle=1;overflow=hidden;" vertex="1" parent="ex_r2"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r2R" value="StoreId (Guid)" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r2"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r3" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tExp"><mxGeometry y="90" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r3L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r3"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r3R" value="Category, Amount" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r3"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r4" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tExp"><mxGeometry y="120" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r4L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r4"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r4R" value="ExpenseDate, Notes" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r4"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r5" value="" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=12;top=0;left=0;right=0;bottom=0;" vertex="1" parent="tExp"><mxGeometry y="150" width="230" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r5L" value="" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r5"><mxGeometry width="40" height="30" as="geometry"/></mxCell>
    <mxCell id="ex_r5R" value="CreatedAt" style="shape=partialRectangle;connectable=0;fillColor=none;top=0;left=0;bottom=0;right=0;overflow=hidden;" vertex="1" parent="ex_r5"><mxGeometry x="40" width="190" height="30" as="geometry"/></mxCell>

    <!-- ══ RELATIONSHIPS ══ -->
    <!-- ApplicationUser 1:N StoreMembers (UserId is string) -->
    <mxCell id="rel_usm" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="u_r1" target="sm_r1" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N StoreMembers -->
    <mxCell id="rel_ssm" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="sm_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Products -->
    <mxCell id="rel_sp" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="pr_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Orders -->
    <mxCell id="rel_so" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="or_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Customers -->
    <mxCell id="rel_sc" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="cu_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Expenses -->
    <mxCell id="rel_se" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="ex_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N Forecasts -->
    <mxCell id="rel_sfc" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="fc_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Stores 1:N InventoryAlerts -->
    <mxCell id="rel_sal" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="s_r1" target="al_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Orders 1:N OrderItems -->
    <mxCell id="rel_ooi" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="or_r1" target="oi_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Products 0..1:N OrderItems (nullable FK) -->
    <mxCell id="rel_poi" value="0..1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERzeroToOne;dashed=1;" edge="1" source="pr_r1" target="oi_r3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Products 1:N InventoryAlerts -->
    <mxCell id="rel_pal" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="pr_r1" target="al_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Products 1:N Forecasts -->
    <mxCell id="rel_pfc" value="1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERone;" edge="1" source="pr_r1" target="fc_r2" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Customers 0..1:N Orders (optional customer on order) -->
    <mxCell id="rel_co" value="0..1:N" style="edgeStyle=entityRelationEdgeStyle;html=1;endArrow=ERmany;startArrow=ERzeroToOne;dashed=1;" edge="1" source="cu_r1" target="or_r3" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 05 — USE CASE DIAGRAM (FIXED: all 11 controllers represented, correct actors)
# ─────────────────────────────────────────────────────────────────────────────
usecase = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1100" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Use Case Diagram [Corrected]" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="400" y="20" width="800" height="40" as="geometry"/></mxCell>

    <!-- System Boundary -->
    <mxCell id="boundary" value="SellWise System" style="swimlane;startSize=30;fillColor=none;strokeColor=#6c8ebf;strokeWidth=2;fontSize=14;fontStyle=1;dashed=1;" vertex="1" parent="1"><mxGeometry x="200" y="70" width="1150" height="980" as="geometry"/></mxCell>

    <!-- ═══ ACTORS ═══ -->
    <!-- Owner (outside left) -->
    <mxCell id="owner" value="Owner" style="shape=mxgraph.archimate3.actor;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="50" y="130" width="60" height="80" as="geometry"/></mxCell>
    <mxCell id="ownerLbl" value="Owner" style="text;html=1;strokeColor=none;fillColor=none;align=center;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="35" y="215" width="90" height="20" as="geometry"/></mxCell>
    <!-- Manager (outside left, mid) -->
    <mxCell id="manager" value="Manager" style="shape=mxgraph.archimate3.actor;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="50" y="450" width="60" height="80" as="geometry"/></mxCell>
    <mxCell id="managerLbl" value="Manager" style="text;html=1;strokeColor=none;fillColor=none;align=center;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="30" y="535" width="100" height="20" as="geometry"/></mxCell>
    <!-- Employee (outside left, bottom) -->
    <mxCell id="employee" value="Employee" style="shape=mxgraph.archimate3.actor;fillColor=#f8cecc;strokeColor=#b85450;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="50" y="790" width="60" height="80" as="geometry"/></mxCell>
    <mxCell id="employeeLbl" value="Employee" style="text;html=1;strokeColor=none;fillColor=none;align=center;fontSize=12;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="28" y="875" width="104" height="20" as="geometry"/></mxCell>
    <!-- ML Service (outside right) -->
    <mxCell id="mlactor" value="Python ML Service" style="shape=mxgraph.archimate3.actor;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="1400" y="450" width="60" height="80" as="geometry"/></mxCell>
    <mxCell id="mlLbl" value="Python ML Service" style="text;html=1;strokeColor=none;fillColor=none;align=center;fontSize=11;" vertex="1" parent="1"><mxGeometry x="1375" y="535" width="110" height="30" as="geometry"/></mxCell>

    <!-- ═══════════════════════════════════════
         USE CASES  (grouped by access level)
         ═══════════════════════════════════════ -->

    <!-- Shared Auth (all 3 roles) -->
    <mxCell id="uc_login" value="Login / Logout" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="50" y="130" width="180" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_register" value="Register Account &amp; Create Store" style="ellipse;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="280" y="130" width="220" height="50" as="geometry"/></mxCell>

    <!-- Owner-only use cases -->
    <mxCell id="grpOwner" value="Owner Only" style="swimlane;startSize=20;fillColor=#fffde7;strokeColor=#d6b656;fontSize=11;dashed=1;" vertex="1" parent="boundary"><mxGeometry x="50" y="230" width="600" height="190" as="geometry"/></mxCell>
    <mxCell id="uc_switch" value="Switch / Create Store" style="ellipse;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="grpOwner"><mxGeometry x="20" y="40" width="170" height="50" as="geometry"/></mxCell>
    <mxCell id="uc_staff" value="Manage Staff&#xa;(Invite / Remove / Assign Role)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="grpOwner"><mxGeometry x="220" y="40" width="185" height="60" as="geometry"/></mxCell>
    <mxCell id="uc_storesettings" value="Store Settings&#xa;(Name, Currency, Timezone)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="grpOwner"><mxGeometry x="20" y="120" width="185" height="55" as="geometry"/></mxCell>
    <mxCell id="uc_profile" value="Edit Profile &amp; Password" style="ellipse;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;fontSize=11;" vertex="1" parent="grpOwner"><mxGeometry x="220" y="120" width="185" height="55" as="geometry"/></mxCell>

    <!-- Manager / Owner use cases -->
    <mxCell id="grpMgr" value="Manager + Owner" style="swimlane;startSize=20;fillColor=#f0fff0;strokeColor=#82b366;fontSize=11;dashed=1;" vertex="1" parent="boundary"><mxGeometry x="50" y="440" width="1050" height="360" as="geometry"/></mxCell>
    <mxCell id="uc_products" value="Manage Products&#xa;(Create / Edit / Delete / CSV Import)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="20" y="40" width="195" height="65" as="geometry"/></mxCell>
    <mxCell id="uc_alerts" value="View Inventory Alerts" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="240" y="40" width="175" height="55" as="geometry"/></mxCell>
    <mxCell id="uc_customers" value="Manage Customers&#xa;(Add / Edit / View)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="440" y="40" width="175" height="65" as="geometry"/></mxCell>
    <mxCell id="uc_rfm" value="View RFM Segments&#xa;(Champion / Loyal / At Risk...)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="640" y="40" width="185" height="65" as="geometry"/></mxCell>
    <mxCell id="uc_expenses" value="Track Expenses" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="850" y="40" width="165" height="55" as="geometry"/></mxCell>
    <mxCell id="uc_dashboard" value="View Dashboard &amp; KPIs&#xa;(Revenue, Orders, Health Score)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="20" y="145" width="195" height="65" as="geometry"/></mxCell>
    <mxCell id="uc_forecast" value="View Demand Forecasts&#xa;(30-day Prophet / EWMA)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="240" y="145" width="190" height="65" as="geometry"/></mxCell>
    <mxCell id="uc_report" value="Generate PDF Sales Reports&#xa;(QuestPDF)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="460" y="145" width="190" height="65" as="geometry"/></mxCell>
    <mxCell id="uc_search" value="Global Search" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="680" y="145" width="165" height="55" as="geometry"/></mxCell>
    <mxCell id="uc_orders_mgr" value="View / Manage All Orders&#xa;(Filter by date / status)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontSize=11;" vertex="1" parent="grpMgr"><mxGeometry x="20" y="260" width="195" height="65" as="geometry"/></mxCell>

    <!-- Employee + Manager + Owner (shared POS) -->
    <mxCell id="grpEmp" value="All Roles (including Employee)" style="swimlane;startSize=20;fillColor=#fff0f0;strokeColor=#b85450;fontSize=11;dashed=1;" vertex="1" parent="boundary"><mxGeometry x="50" y="820" width="800" height="130" as="geometry"/></mxCell>
    <mxCell id="uc_catalog" value="View Product Catalog" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="grpEmp"><mxGeometry x="20" y="40" width="185" height="55" as="geometry"/></mxCell>
    <mxCell id="uc_pos" value="Add Items to Cart&#xa;&amp; Process POS Order" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="grpEmp"><mxGeometry x="240" y="35" width="185" height="65" as="geometry"/></mxCell>
    <mxCell id="uc_orderstatus" value="Update Order Status&#xa;(pending / processing / completed)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="grpEmp"><mxGeometry x="455" y="35" width="200" height="65" as="geometry"/></mxCell>

    <!-- ML Service Use Case -->
    <mxCell id="uc_mlforecast" value="Compute 30-day Forecast&#xa;(Prophet model)" style="ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontSize=11;" vertex="1" parent="boundary"><mxGeometry x="880" y="450" width="190" height="65" as="geometry"/></mxCell>

    <!-- ═══ ACTOR ASSOCIATIONS ═══ -->
    <!-- Owner -> Auth -->
    <mxCell id="a_ol" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_login" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_or" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_register" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Owner -> Owner group -->
    <mxCell id="a_oswitch" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_switch" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_ostaff" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_staff" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_osett" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_storesettings" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_oprof" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_profile" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Owner -> Manager group (all) -->
    <mxCell id="a_odash" style="edgeStyle=none;html=1;" edge="1" source="owner" target="uc_dashboard" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Manager -> Auth -->
    <mxCell id="a_ml" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_login" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Manager -> Manager group -->
    <mxCell id="a_mprod" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_products" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_malerts" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_alerts" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_mcust" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_customers" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_mrfm" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_rfm" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_mexp" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_expenses" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_mfcast" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_forecast" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_mrep" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_report" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_msrch" style="edgeStyle=none;html=1;" edge="1" source="manager" target="uc_search" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Employee -> Auth -->
    <mxCell id="a_el" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_login" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Employee -> Employee group -->
    <mxCell id="a_ecat" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_catalog" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_epos" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_pos" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="a_eord" style="edgeStyle=none;html=1;" edge="1" source="employee" target="uc_orderstatus" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- ML Service association -->
    <mxCell id="a_mluc" style="edgeStyle=none;html=1;" edge="1" source="mlactor" target="uc_mlforecast" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Dashboard uses ML forecast (include) -->
    <mxCell id="inc_fcast" value="&lt;&lt;include&gt;&gt;" style="edgeStyle=orthogonalEdgeStyle;html=1;dashed=1;endArrow=open;endFill=0;" edge="1" source="uc_forecast" target="uc_mlforecast" parent="boundary"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# ─────────────────────────────────────────────────────────────────────────────
# 08 — CLASS DIAGRAM (FIXED: correct method names, removed fake fields,
#      added all missing controllers & services)
# ─────────────────────────────────────────────────────────────────────────────
classdiag = r"""<?xml version="1.0" encoding="UTF-8"?>
<mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1800" pageHeight="1200" math="0" shadow="0">
  <root>
    <mxCell id="0"/><mxCell id="1" parent="0"/>
    <mxCell id="title" value="SellWise - Class Diagram [Corrected]" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="500" y="20" width="800" height="40" as="geometry"/></mxCell>

    <!-- ═══════════════════════════════════════════════════
         LAYER 1: BaseController (abstract) — FIXED
         - Only has Db (AppDbContext), no _userManager
         - Correct method: UserBelongsToStore() not IsStoreMember()
         - No GetCurrentUserAsync() (does not exist)
         ═══════════════════════════════════════════════════ -->
    <mxCell id="BaseCtrl" value="&lt;&lt;abstract&gt;&gt; BaseController" style="shape=table;startSize=36;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1"><mxGeometry x="650" y="80" width="300" height="170" as="geometry"/></mxCell>
    <mxCell id="bc_shdr" value="Properties" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#dae8fc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="BaseCtrl"><mxGeometry y="36" width="300" height="22" as="geometry"/></mxCell>
    <mxCell id="bc_p1" value="# Db: AppDbContext" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="58" width="300" height="24" as="geometry"/></mxCell>
    <mxCell id="bc_mhdr" value="Methods" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#dae8fc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;fontStyle=1;" vertex="1" parent="BaseCtrl"><mxGeometry y="82" width="300" height="22" as="geometry"/></mxCell>
    <mxCell id="bc_m1" value="# GetCurrentStoreId(): Guid" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="104" width="300" height="24" as="geometry"/></mxCell>
    <mxCell id="bc_m2" value="# UserBelongsToStore(storeId): Task&lt;bool&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="128" width="300" height="24" as="geometry"/></mxCell>
    <mxCell id="bc_m3" value="+ OnActionExecutionAsync(...): override" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="BaseCtrl"><mxGeometry y="152" width="300" height="24" as="geometry"/></mxCell>

    <!-- AuthController (does NOT inherit BaseController — plain Controller) -->
    <mxCell id="AuthCtrl" value="AuthController" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#f5f5f5;strokeColor=#666666;" vertex="1" parent="1"><mxGeometry x="40" y="80" width="280" height="140" as="geometry"/></mxCell>
    <mxCell id="ac_note" value="(NOT a BaseController subclass)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=#ffe6cc;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=10;top=0;left=0;right=0;bottom=1;fontStyle=2;" vertex="1" parent="AuthCtrl"><mxGeometry y="30" width="280" height="22" as="geometry"/></mxCell>
    <mxCell id="ac_p1" value="- _userManager: UserManager&lt;ApplicationUser&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AuthCtrl"><mxGeometry y="52" width="280" height="24" as="geometry"/></mxCell>
    <mxCell id="ac_p2" value="- _signInManager: SignInManager&lt;...&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AuthCtrl"><mxGeometry y="76" width="280" height="24" as="geometry"/></mxCell>
    <mxCell id="ac_m1" value="+ Login(model): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AuthCtrl"><mxGeometry y="100" width="280" height="24" as="geometry"/></mxCell>
    <mxCell id="ac_m2" value="+ Register(model): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AuthCtrl"><mxGeometry y="124" width="280" height="24" as="geometry"/></mxCell>

    <!-- ═══ LAYER 2: BaseController Subcontrollers ═══ -->

    <!-- DashboardController -->
    <mxCell id="DashCtrl" value="DashboardController" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="40" y="340" width="290" height="130" as="geometry"/></mxCell>
    <mxCell id="dc_p1" value="- _analytics: AnalyticsService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="DashCtrl"><mxGeometry y="30" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="dc_p2" value="- _scopeFactory: IServiceScopeFactory" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="DashCtrl"><mxGeometry y="54" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="dc_m1" value="+ Index(range, page): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="DashCtrl"><mxGeometry y="78" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="dc_m2" value="+ ForecastGrid(range, page): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="DashCtrl"><mxGeometry y="102" width="290" height="24" as="geometry"/></mxCell>

    <!-- OrderController -->
    <mxCell id="OrdCtrl" value="OrderController" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="380" y="340" width="290" height="130" as="geometry"/></mxCell>
    <mxCell id="oc_p1" value="- _orderService: IOrderService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="OrdCtrl"><mxGeometry y="30" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="oc_m1" value="+ Index(search, status, ...): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdCtrl"><mxGeometry y="54" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="oc_m2" value="+ Create(model): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdCtrl"><mxGeometry y="78" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="oc_m3" value="+ UpdateStatus(id, status): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdCtrl"><mxGeometry y="102" width="290" height="24" as="geometry"/></mxCell>

    <!-- ProductController -->
    <mxCell id="ProdCtrl" value="ProductController" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="720" y="340" width="290" height="130" as="geometry"/></mxCell>
    <mxCell id="pc_p1" value="- _productService: IProductService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="ProdCtrl"><mxGeometry y="30" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="pc_m1" value="+ Index(): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdCtrl"><mxGeometry y="54" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="pc_m2" value="+ Create / Edit / Delete(...)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdCtrl"><mxGeometry y="78" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="pc_m3" value="+ ImportCsv(file): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdCtrl"><mxGeometry y="102" width="290" height="24" as="geometry"/></mxCell>

    <!-- CustomerController -->
    <mxCell id="CustCtrl" value="CustomerController" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="1060" y="340" width="290" height="130" as="geometry"/></mxCell>
    <mxCell id="cc_p1" value="- _rfmService: IRfmService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="CustCtrl"><mxGeometry y="30" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="cc_m1" value="+ Index(search, segment, sort, page)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="CustCtrl"><mxGeometry y="54" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="cc_m2" value="+ Recalculate(id): Task&lt;IActionResult&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="CustCtrl"><mxGeometry y="78" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="cc_m3" value="+ Create / Edit / Delete(...)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="CustCtrl"><mxGeometry y="102" width="290" height="24" as="geometry"/></mxCell>

    <!-- Other controllers (collapsed summary) -->
    <mxCell id="OtherCtrls" value="Other BaseController Subclasses" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1"><mxGeometry x="1400" y="340" width="290" height="130" as="geometry"/></mxCell>
    <mxCell id="oc_other1" value="ReportController (QuestPDF)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OtherCtrls"><mxGeometry y="30" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="oc_other2" value="AlertController" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OtherCtrls"><mxGeometry y="54" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="oc_other3" value="ExpenseController" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OtherCtrls"><mxGeometry y="78" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="oc_other4" value="SettingsController / SearchController" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OtherCtrls"><mxGeometry y="102" width="290" height="24" as="geometry"/></mxCell>

    <!-- ═══ LAYER 3: Services ═══ -->

    <!-- AnalyticsService -->
    <mxCell id="AnaServ" value="AnalyticsService" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="40" y="580" width="320" height="150" as="geometry"/></mxCell>
    <mxCell id="as_p1" value="- _db: AppDbContext" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="AnaServ"><mxGeometry y="30" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="as_p2" value="- _forecastService: ForecastService" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="54" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="as_m1" value="+ GetOverview(storeId, range, page, pageSize)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="78" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="as_m2" value="+ GetForecastsPageAsync(storeId, range, page, size)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="102" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="as_m3" value="- PadHistoryWithZeros(history): List" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AnaServ"><mxGeometry y="126" width="320" height="24" as="geometry"/></mxCell>

    <!-- ForecastService -->
    <mxCell id="FcServ" value="ForecastService" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="420" y="580" width="320" height="150" as="geometry"/></mxCell>
    <mxCell id="fs_p1" value="- _http: HttpClient (timeout 5s)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="FcServ"><mxGeometry y="30" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="fs_p2" value="- _mlUrl: string (config: MlServiceUrl)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="FcServ"><mxGeometry y="54" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="fs_m1" value="+ GetForecastAsync(storeId, productId, history, periods)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="FcServ"><mxGeometry y="78" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="fs_m2" value="  POST {_mlUrl}/api/v1/ml/forecast" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=10;top=0;left=0;right=0;bottom=0;fontStyle=2;" vertex="1" parent="FcServ"><mxGeometry y="102" width="320" height="22" as="geometry"/></mxCell>
    <mxCell id="fs_m3" value="+ IsAvailableAsync(): Task&lt;bool&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="FcServ"><mxGeometry y="124" width="320" height="26" as="geometry"/></mxCell>

    <!-- OrderService -->
    <mxCell id="OrdServ" value="OrderService : IOrderService" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#fff2cc;strokeColor=#d6b656;" vertex="1" parent="1"><mxGeometry x="800" y="580" width="320" height="150" as="geometry"/></mxCell>
    <mxCell id="os_p1" value="- _db: AppDbContext" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="OrdServ"><mxGeometry y="30" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="os_m1" value="+ CreateOrderAsync(storeId, model): Task&lt;string?&gt;" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdServ"><mxGeometry y="54" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="os_m2" value="  BeginTransactionAsync() -> commit/rollback" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=10;top=0;left=0;right=0;bottom=0;fontStyle=2;" vertex="1" parent="OrdServ"><mxGeometry y="78" width="320" height="22" as="geometry"/></mxCell>
    <mxCell id="os_m3" value="+ GetDashboardKpisAsync(storeId)" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdServ"><mxGeometry y="100" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="os_m4" value="+ GetOrdersPagedAsync(storeId, ...): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="OrdServ"><mxGeometry y="124" width="320" height="26" as="geometry"/></mxCell>

    <!-- ═══ LAYER 4: Domain Services ═══ -->

    <!-- RfmService - FIXED: correct method name RecalculateAllAsync -->
    <mxCell id="RfmServ" value="RfmService : IRfmService" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="40" y="840" width="320" height="130" as="geometry"/></mxCell>
    <mxCell id="rfm_p1" value="- _db: AppDbContext" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="RfmServ"><mxGeometry y="30" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="rfm_m1" value="+ RecalculateAllAsync(storeId): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="RfmServ"><mxGeometry y="54" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="rfm_m2" value="- CalculateRecencyScore(days): int" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="RfmServ"><mxGeometry y="78" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="rfm_m3" value="- DetermineSegment(r, f, m): string" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="RfmServ"><mxGeometry y="102" width="320" height="24" as="geometry"/></mxCell>

    <!-- AlertService - FIXED: correct method name ScanAndGenerateAlertsAsync -->
    <mxCell id="AltServ" value="AlertService : IAlertService" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="420" y="840" width="320" height="130" as="geometry"/></mxCell>
    <mxCell id="alt_p1" value="- _db: AppDbContext" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="AltServ"><mxGeometry y="30" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="alt_m1" value="+ ScanAndGenerateAlertsAsync(storeId): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="AltServ"><mxGeometry y="54" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="alt_m2" value="  Resolves + creates InventoryAlert rows" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=10;top=0;left=0;right=0;bottom=0;fontStyle=2;" vertex="1" parent="AltServ"><mxGeometry y="78" width="320" height="22" as="geometry"/></mxCell>

    <!-- ProductService -->
    <mxCell id="ProdServ" value="ProductService : IProductService" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="800" y="840" width="320" height="100" as="geometry"/></mxCell>
    <mxCell id="ps_m1" value="+ GetPagedAsync(storeId, search, ...): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="ProdServ"><mxGeometry y="30" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="ps_m2" value="+ ImportFromCsvAsync(file, storeId): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdServ"><mxGeometry y="54" width="320" height="24" as="geometry"/></mxCell>
    <mxCell id="ps_m3" value="+ UpdateAsync(product): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="ProdServ"><mxGeometry y="78" width="320" height="24" as="geometry"/></mxCell>

    <!-- CustomerService -->
    <mxCell id="CustServ" value="CustomerService : ICustomerService" style="shape=table;startSize=30;container=1;collapsible=1;childLayout=tableLayout;fixedRows=1;rowLines=0;fontStyle=1;align=center;resizeLast=1;fillColor=#e1d5e7;strokeColor=#9673a6;" vertex="1" parent="1"><mxGeometry x="1180" y="840" width="290" height="100" as="geometry"/></mxCell>
    <mxCell id="cs_m1" value="+ GetPagedAsync(storeId, ...): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=1;" vertex="1" parent="CustServ"><mxGeometry y="30" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="cs_m2" value="+ CreateAsync(model, storeId): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="CustServ"><mxGeometry y="54" width="290" height="24" as="geometry"/></mxCell>
    <mxCell id="cs_m3" value="+ DeleteAsync(id, storeId): Task" style="shape=tableRow;horizontal=0;startSize=0;swimlaneHead=0;swimlaneBody=0;fillColor=none;collapsible=0;dropTarget=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontSize=11;top=0;left=0;right=0;bottom=0;" vertex="1" parent="CustServ"><mxGeometry y="78" width="290" height="24" as="geometry"/></mxCell>

    <!-- ═══ RELATIONSHIPS ═══ -->
    <!-- AuthController - plain inheritance from Controller (not Base) -->
    <mxCell id="inh_auth" value="extends Controller" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;startArrow=none;dashed=1;" edge="1" source="AuthCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- BaseCtrl subclasses (solid inheritance) -->
    <mxCell id="inh_dash" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;" edge="1" source="DashCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="inh_ord" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;" edge="1" source="OrdCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="inh_prod" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;" edge="1" source="ProdCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="inh_cust" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;" edge="1" source="CustCtrl" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="inh_other" value="" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=block;endFill=0;" edge="1" source="OtherCtrls" target="BaseCtrl" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <!-- Service uses (dashed dependency) -->
    <mxCell id="use_da" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="DashCtrl" target="AnaServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="use_oo" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="OrdCtrl" target="OrdServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="use_pc" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="ProdCtrl" target="ProdServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="use_cc" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="CustCtrl" target="RfmServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="use_af" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="AnaServ" target="FcServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="use_oa" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="OrdServ" target="AltServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
    <mxCell id="use_cc2" value="uses" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=open;endFill=0;dashed=1;" edge="1" source="CustCtrl" target="CustServ" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>
  </root>
</mxGraphModel>"""

# Write corrected files
files = {
    "03_DFD_Level1.drawio": dfd1,
    "04_ER_Diagram.drawio": er,
    "05_Use_Case_Diagram.drawio": usecase,
    "08_Class_Diagram.drawio": classdiag,
}

for filename, content in files.items():
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    kb = len(content.encode("utf-8")) / 1024
    print("FIXED: " + filename + " (" + str(round(kb, 1)) + " KB)")

print("\nAll 4 corrected diagrams written.")
print("Unchanged (already correct): 01_Gantt_Chart, 02_DFD_Level0, 06_Activity_Diagram, 07_Sequence_Diagram")
