import React, {useEffect, useState} from "react";
import AddonCard from "../components/AddonCard";
import {compareTwoStrings} from 'string-similarity'

import './addons.css';
import Tooltiped from "../components/Tooltiped";
import { FaCheck } from "react-icons/fa";
import Head from "../components/Head";


function AddonsPage() {
    const [addons, setAddons] = useState([]);
    const [loadedChunks, setLoadedChunks] = useState([])
    const [filter, setFilter] = useState({query:"", verified:true});

    useEffect(() => {
        fetchChunk('ver')
    }, [])

    useEffect(() => {
        if (!filter.verified) {
            fetchChunk('unver')
        }
    }, [filter])

    function fetchChunk(chunk) {
        if (loadedChunks.includes(chunk)) return;
        setLoadedChunks([...loadedChunks, chunk])
        fetch(`https://raw.githubusercontent.com/AntiCope/anticope.ml/data/addons-${chunk}.json?v=${Math.random()}`)
            .then(res => res.json())
            .then(newAddons => {
                setAddons([...addons, ...newAddons])
            })
    }

    function weight(addon) {
        try {
            if (filter.query === "")
            return addon.verified?1:0;
            return (
                compareTwoStrings(filter.query, addon.name.toLowerCase()) 
                + compareTwoStrings(filter.query, addon.authors.join(" ").toLowerCase())*0.6
                + compareTwoStrings(filter.query, addon.summary.toLowerCase())*0.4
                + addon.verified?0.5:0) / 2.5;
        } catch {
            return 0;
        }

    }

    function shouldShow(addon) {
        try {
            if (filter.verified && !addon.verified) return false
            if (filter.query !== "") {
                if (compareTwoStrings(filter.query, addon.name.toLowerCase()) < 0.3) {
                    if (compareTwoStrings(filter.query, addon.authors.join(" ").toLowerCase()) < 0.4) {
                        if (compareTwoStrings(filter.query, addon.summary.toLowerCase()) < 0.5) {
                            return false
                        }
                    }
                }
            }
        } catch {
            return false;
        }


        return true;
    }

    return <article id="addons-page">
        <Head title="Meteor Client Addons" summary="Browse free and open-source Addons that can be used alongside Meteor Client." />
        <h3>
            Browse free and open-source Addons that can be used alongside Meteor Client.
        </h3>
        <header className="Filter">
            <input onChange={(evt) => {setFilter({...filter, query:evt.target.value.toLowerCase()})}} className="Search" type="text" placeholder="search here..." value={filter.query}/>
            <Tooltiped tooltip="Show verified only">
                <div className={"CheckBox " + (filter.verified?" checked":"")} onClick={() => setFilter({...filter, verified:!filter.verified})}>
                    <FaCheck />
                </div>
            </Tooltiped>
        </header>
        <section className="addon-grid">
            {addons.filter(shouldShow).sort((a,b) => weight(b) - weight(a)).slice(0, 50).map((addon) => {
                return <AddonCard key={addon.id} addon={addon} />
            })}
        </section>
    </article>
}

export default AddonsPage