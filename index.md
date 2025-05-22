---
title: Telling Stories with Data ...
description: Little nuggets that tell some of my story as I've worked with data in different places and with different people. And what I've learnt along the way.  
---

### Links

* [_public github repository_](https://github.com/aba-sah) 
* contribution to the [___Scottish Tech Army Climate Dashboard___](https://github.com/Scottish-Tech-Army/STAClimateDashboard) &ndash; visual analysis of [_active travel_](https://github.com/Scottish-Tech-Army/STAClimateDashboard/tree/master/code/r/cycling_and_walking) across Scotland
* some publications documenting previous work &ndash; on the [_dblp computer science bibliography_](https://dblp.uni-trier.de/pers/hd/d/Dadzie:Aba=Sah)
* supplementary information for publications on [figshare](https://figshare.com/authors/Aba_Sah_Dadzie/762011)

<p>&nbsp;</p>


### Visual Storytelling
 
Unfortunately a good part of my work sits behind IP and commercially sensitive walls. Luckily, I've also worked on some projects that required or at least encouraged openly sharing results, typically with a [___CC BY license___](https://creativecommons.org/share-your-work/cclicenses). The latter typically allow more room for innovation and exploration, and the skill I developed and knowledge I gained on those have ultimately fed back into the work that sits behind those walls! A selection of the open interactive visualisations I've built &mdash;\
as demonstrators to illustrate the outcomes of work to:
  * model, merge and/or build on open datasets, to provide a consistent, single source of truth for wider reuse
  * perform root cause analysis during issue resolution

to uncover and tell stories contained within data, to:  
  * guide context-sensitive analysis and "follow your nose" to uncover relationships within highly inter-linked data
  * track and explore evolving trends, as for [_pupil_](sta/sta_it_402_dress_code.html) and [_teacher_](sta/sta_it_402_dress_code_teacher_demographics.html) demographics in Scotland, working with [__dressCode__](https://www.dresscode.org.uk/scotlands-computing-science-landscape) and the [__Scottish Tech Army__](https://www.scottishtecharmy.org)
  * provide insight into complex, multi-source, high-dimensional and/or inter-related data, as seen in a summary of changes to active travel data across Scotland [_prior to and during the 2020 and 2021 lockdowns_](sta/cycle_counters_info_cards.pdf). (See also [___the interactive version___](sta/sta-climate-change_cycling.html))
  * serve as an agile, adaptable, working tool to explore alternative scenarios, as when [___modelling operations within a digital business ecosystem___](ebri_dbn/index.html)



{::nomarkdown}
<!--
When I'm not behind a computer, I'm likely to be found on a bike or fixing one. Given the opportunity to contribute to building a Climate Dashboard for the Scottish Tech Army in the runup to COP26, I started looking at Cycling UK's open active travel data, collected from counters across Scotland. The original dataset has been extended since, and now includes multiple sources &ndash; local authorities, Sustrans and, most recently, trunk roads. 
  * provide insight into complex, multi-source, high-dimensional and/or inter-related data, as seen in a summary of changes to active travel data across Scotland [_prior to and during the 2020 and 2021 lockdowns_](sta/cycle_counters_info_cards.pdf). (See also [___the 
[_code for the_front end of the active travel section_](https://github.com/Scottish-Tech-Army/STAClimateDashboard/tree/master/code/r/cycling_and_walking) of the [___Scottish Tech Army Climate Dashboard___](https://github.com/Scottish-Tech-Army/STAClimateDashboard)  
-->
{:/}


<p>&nbsp;</p>
  
### Modelling &amp; Mastering Data

Invariably, building each visualisation meant reusing domain and/or third party (open) data. Where exploring new scenarios this sometimes meant initially creating dummy data on top of the data model built with domain owners and/or end users. For third party data sometimes this meant deriving the data model first, in order to extend this and/or build extensible visualisations directly on top of the data and associated situation models.

I am a visual thinker, so learning early in my career to work with ontologies and graph models, predominantly on semantic web data-driven projects, has been a blessing in more ways than I can count. Especially since translating these models into simple node-link graphs that mimic mind maps allows pretty much anyone to follow relationships within the data, and quickly obtain an overview of a dataset, without needing a background in complex data analysis or graph models.

Experience has also taught me modelling data and building or cleaning with an eye to reuse means that over time you recoup the up to 80% of project time that may be required to clean and preprocess data &ndash; with reusable data pipelines, cleaning code and even mastered data subsets in other data projects. 

A couple examples of data models I've built, to feed into visualisation-guided analysis:
  * [___Energy from Waste ontology___](https://doi.org/10.6084/m9.figshare.6554606.v5), to feed into modelling operations and quantifying value within a digital business ecosystem
  * [___Scottish Qualifications Authority data &ndash; pupil grades &amp; teacher demographics___](https://github.com/aba-sah/sta-it402-dresscode/blob/626b08f849447a15ca54d37f0cf5eac46b20b43a/docs/sta-it-402_data_structure.pdf)
  * ___Skill and job role similarity analysis___

##### Situation &amp; scenario modelling
  * [___Proposal for a green-themed business___](twothreethree/data_modelling/gcs_asdadzie_final.pdf) that won me a scholarship to study for an MBA


{::nomarkdown}

<!--

### Cleaning, Enriching &amp; Mastering Data

The most painful and tedious part of (pre-)analysis &ndash; cleaning, prepping and often enriching data to enable practical use. If you've ever worked on anything but the most trivial dataset (I'm struggling to think of one that would provide anything useful) you quickly learn the value in budgeting up to 80% of project time for data creation and/or third party data pre-processing. Unless you're lucky enough to obtain third party, machine-readable data that closely matches your data model. Or your client has their data ready to go and as needed.\ 
In my experience refusing to acknowledge how much effort is involved in data preprocessing doesn't save you time even short term, and only increases pain long term. At best this is written off as technical debt; more often it results in data that is simply not used or usable or that comes with high cost of use, where alternatives do not exist.  

On the other hand, modelling data and building or cleaning with an eye to reuse means that over time you recoup that time reusing data pipelines, code and even data subsets in other data projects. So the first time I encountered the (new-ish) term __Master Data Management MDM__ and its sister, __Reference Data Management (RDM)__, I realised I had been being doing MDM/RDM pretty much my entire data career. We just called it a variety of other things. 

The majority of the effort expended and complexity I've encountered has been to (attempt to) resolve:
 * mismatch between the initial intended use of data and actual use or need
 * data templates provided at relatively high level to multiple data providers resulting in seemingly structured data, but with wide variation in granularity, format, consistency and content, even for the same provider
 * semi-structured and unstructured public data collections generated as a side effect of some task, often containing valuable information but in formats that do not lend themselves to semi or fully automated analysis
 * incomplete, inconsistently formatted and/or actively obfuscated data; sometimes to protect privacy or sensitivity, in some cases carried out such as to render entire datasets unusable beyond scanning for very high level changes in trends..

The projects I found simultaneously challenging and enriching were also the most successful, working with design and NLP teams and clients to (re)model data and build tools to help our end users capture working data such that it was immediately human and machine-readable. Each of those won us new contracts, based on the trust we built and the value clearly gained for on-going and longer term work.

-->
{:/}


{::nomarkdown}
  <!-- a href="ebri_dashboard.html">EBRI dashboard</a -->

  <!-- p>d3.express is now Observable</p -->
{:/}
