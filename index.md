---
title: Telling Stories with Data ...
description: Little nuggets that tell some of my story as I've worked with data in different places and with different people. And what I've learnt along the way.  
---


### Visual Storytelling
 
Unfortunately a good part of my work sits behind IP and commercially sensitive walls. Luckily, I've also worked on some projects that required or at least encouraged openly sharing results, typically with a [___CC BY license___](https://creativecommons.org/share-your-work/cclicenses). The latter typically allow more room for innovation and exploration, and the skill I developed and knowledge I gained on those have ultimately fed back into the work that sits behind those walls! A selection of the open interactive visualisations I've built &mdash;\
as demonstrators to illustrate the outcomes of work to:
  * model, merge and/or build on open datasets, to provide a consistent, single source of truth for wider reuse
  * perform root cause analysis during issue resolution

to uncover and tell stories contained within data, to:  
  * guide context-sensitive analysis and "follow your nose" to uncover relationships within highly inter-linked data
  * track and explore evolving trends, as for [_pupil_](sta/sta_it_402_dress_code) and [_teacher_](sta/sta_it_402_dress_code_teacher_demographics) demographics in Scotland, working with [__dressCode__](https://www.dresscode.org.uk/scotlands-computing-science-landscape) and the [__Scottish Tech Army__](https://www.scottishtecharmy.org)
  * provide insight into complex, multi-source, high-dimensional and/or inter-related data, as seen in a summary of changes to active travel data across Scotland [_prior to and during the 2020 and 2021 lockdowns_](sta/cycle_counters_info_cards.pdf). (See also [___the interactive version___](sta/sta-climate-change_cycling.html))
  * serve as an agile, adaptable, working tool to explore alternative scenarios, as when [___modelling operations within a digital business network___](ebri_dbn/index.html)

  
### Modeling Data

Invariably, building each visualisation meant reusing domain and/or third party (open) data. Where exploring new scenarios this sometimes meant initially creating dummy data on top of the data model built with domain owners and/or end users. For third party data sometimes this meant deriving the data model first, in order to extend this and/or build extensible visualisations directly on top of the data and associated situation models.

I am a visual thinker, so learning early in my career to work with ontologies and graph models, working predominantly on semantic web data-driven projects, has been a blessing in more ways than I can count. I've found also that translating these models into simple node-link graphs that mimic mind maps allows pretty much anyone to follow relationships within the data, and quickly obtain an overview of a dataset, without needing a background in complex data analysis or graph models.


### Cleaning, Enriching &amp; Mastering Data

The most painful and tedious part of (pre-)analysis &ndash; cleaning, prepping and often enriching data to enable practical use. If you've ever worked on anything but the most trivial dataset (I'm struggling to think of one that would provide anything useful) you quickly learn the value in budgeting up to 80% of project time for data creation and/or third party data pre-processing. Unless you're lucky enough to obtain third party, machine-readable data that closely matches your data model. Or your client has their data ready to go and as needed.\ 
In my experiencing refusing to acknowledge how much effort is involved in data preprocessing doesn't save you time even short term, and only increases pain long term. At best this is written off as technical debt; more often it results in data that is simply not used or usable or that comes with high cost of use, where alternatives do not exist.  

On the other hand, modeling data and building or cleaning with an eye to reuse means that over time you recoup that time reusing data pipelines, code and even data subsets in other data projects. So the first time I encountered the (new-ish) term __Master Data Management MDM__ and its sister, __Reference Data Management (RDM)__, I realised I had been being doing MDM/RDM pretty much my entire data career. We just called it a variety of other things. 

The majority of the effort expended and complexity I've encountered has been to (attempt to) resolve:\
 * mismatch between the initial intended use of data and actual use or need
 * data templates provided at relatively high level to multiple data providers resulting in seemingly structured data, but with wide variation in granularity, format, consistency and content, even for the same provider
 * semi-structured and unstructured public data collections generated as a side effect of some task, often containing valuable information but in formats that do not lend themselves to semi or fully automated analysis
 * incomplete, inconsistently formatted and/or actively obfuscated data; sometimes to protect privacy or sensitivity, in some cases carried out such as to render entire datasets unusable beyond scanning for very high level changes in trends..

The projects I found simultaneously challenging and enriching were also the most successful, working with design and NLP teams and clients to (re)model data and build tools to help our end users capture working data such that it was immediately human and machine-readable. Each of those won us new contracts, based on the trust we built and the value clearly gained for on-going and longer term work.

{::nomarkdown}
  <!-- a href="ebri_dashboard.html">EBRI dashboard</a -->

  <!-- p>d3.express is now Observable</p -->
{:/}
