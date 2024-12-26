// now onto the New Additions section

// track the earliest confirmation of a species by any user on the ignore list. Once all the data is gathered up, we:
//    (a) ignore any records earlier than the earliest confirmation
//    (b)

// if (!newAdditions[ident.taxon.id] || newAdditions[ident.taxon.id].curatorConfirmationDate < ident.created_at) {
//   const taxonomy = getTaxonomy(ident.taxon.ancestors, taxonsToReturn);

//   newAdditions[ident.taxon.id] = {
//     taxonomy,
//     species: ident.taxon.name,
//     observerUsername: obs.user.login,
//     observerName: obs.user.name,
//     obsDate: ident.created_at,
//     // obsId: ident.taxon_id,
//     obsPhoto: obs.photos && obs.photos.length > 0 ? obs.photos[0].url : null,
//     url: obs.uri,
//     curatorConfirmationDate: ident.created_at,
//   };
// }
