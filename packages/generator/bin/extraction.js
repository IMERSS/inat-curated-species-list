// export const extractSpecies = (rawData: GetDataPacketResponse, curators: string, taxonsToReturn: Taxon[]) => {
//   const curatorArray = splitStringByComma(curators);
//   rawData.results.forEach((obs) => {
//     obs.identifications.forEach((ident) => {
//       if (curatorArray.indexOf(ident.user.login) === -1) {
//         return;
//       }
//       if (!ident.current) {
//         return;
//       }
//       // ignore anything that isn't a species. Currently we're ignoring subspecies data and anything in a more general
//       // rank isn't of use
//       if (ident.taxon.rank !== 'species') {
//         return;
//       }
//       // the data from the server is sorted by ID - oldest to newest - so here we've found the first *observation* of a species
//       // that meets our curated reviewer requirements. This tracks when the species was *first confirmed* by a curated reviewer,
//       // which might be vastly different from when the sighting was actually made
//       if (!curatedSpeciesData[ident.taxon_id]) {
//         const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);
//         taxonomy.species = ident.taxon.name;
//         curatedSpeciesData[ident.taxon_id] = { data: taxonomy, count: 1 };
//         // note: count just tracks how many observations have been reviewed and confirmed by our curators, not by anyone
//       } else {
//         curatedSpeciesData[ident.taxon_id].count++;
//       }
//       // now onto the New Additions section
//       // track the earliest confirmation of a species by any user on the ignore list. Once all the data is gathered up, we:
//       //    (a) ignore any records earlier than the earliest confirmation
//       //    (b)
//       // if (!newAdditions[ident.taxon.id] || newAdditions[ident.taxon.id].curatorConfirmationDate < ident.created_at) {
//       //   const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);
//       //   newAdditions[ident.taxon.id] = {
//       //     taxonomy,
//       //     species: ident.taxon.name,
//       //     observerUsername: obs.user.login,
//       //     observerName: obs.user.name,
//       //     obsDate: ident.created_at,
//       //     // obsId: ident.taxon_id,
//       //     obsPhoto: obs.photos && obs.photos.length > 0 ? obs.photos[0].url : null,
//       //     url: obs.uri,
//       //     curatorConfirmationDate: ident.created_at,
//       //   };
//       // }
//     });
//   });
// };
